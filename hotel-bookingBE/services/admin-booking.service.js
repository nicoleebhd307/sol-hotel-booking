const { BOOKINGS_MOCK } = require('../mockData/booking');
const { REFUND_REQUESTS_MOCK } = require('../mockData/refunds');

class AdminBookingService {
  listBookings(filters = {}) {
    const { status, date, search } = filters;

    return BOOKINGS_MOCK
      .map((booking) => this.toAdminBooking(booking))
      .filter((booking) => {
        if (status && status !== 'all' && booking.status !== status) {
          return false;
        }

        if (date && booking.checkInDate !== date && booking.createdAt !== date) {
          return false;
        }

        if (search) {
          const q = search.trim().toLowerCase();
          const haystack = `${booking.bookingId} ${booking.phone}`.toLowerCase();
          if (!haystack.includes(q)) {
            return false;
          }
        }

        return true;
      });
  }

  getDashboardSummary(filters = {}) {
    const rows = this.listBookings(filters);

    return {
      totalBookings: rows.length,
      totalRevenue: rows.reduce((sum, row) => sum + row.totalAmount, 0),
      totalDeposits: rows.reduce((sum, row) => sum + row.depositAmount, 0),
    };
  }

  getReports({ month, year }) {
    const now = new Date();
    const safeYear = Number.isFinite(Number(year)) ? Number(year) : now.getUTCFullYear();
    const safeMonth = Number.isFinite(Number(month)) ? Number(month) : now.getUTCMonth() + 1;

    const reportRows = BOOKINGS_MOCK
      .map((booking) => this.toAdminBooking(booking))
      .filter((booking) => {
        const date = new Date(booking.checkInDate);
        return date.getUTCFullYear() === safeYear && date.getUTCMonth() + 1 === safeMonth;
      });

    const previousPeriod = this.getPreviousMonthYear(safeMonth, safeYear);
    const previousRows = BOOKINGS_MOCK
      .map((booking) => this.toAdminBooking(booking))
      .filter((booking) => {
        const date = new Date(booking.checkInDate);
        return date.getUTCFullYear() === previousPeriod.year && date.getUTCMonth() + 1 === previousPeriod.month;
      });

    const totalRevenue = reportRows.reduce((sum, row) => sum + row.totalAmount, 0);
    const totalBookings = reportRows.length;
    const totalCancelledBookings = reportRows.filter((row) => row.status === 'cancelled').length;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    const previousRevenue = previousRows.reduce((sum, row) => sum + row.totalAmount, 0);
    const previousBookings = previousRows.length;
    const previousCancelled = previousRows.filter((row) => row.status === 'cancelled').length;
    const previousAverage = previousBookings > 0 ? previousRevenue / previousBookings : 0;

    const daysInMonth = new Date(Date.UTC(safeYear, safeMonth, 0)).getUTCDate();
    const revenueByDayMap = new Map();
    for (let day = 1; day <= daysInMonth; day += 1) {
      revenueByDayMap.set(day, 0);
    }

    reportRows.forEach((row) => {
      const date = new Date(row.checkInDate);
      const day = date.getUTCDate();
      const current = revenueByDayMap.get(day) || 0;
      revenueByDayMap.set(day, current + row.totalAmount);
    });

    const statusDistribution = {
      pending: reportRows.filter((row) => row.status === 'pending').length,
      confirmed: reportRows.filter((row) => row.status === 'confirmed').length,
      cancelled: reportRows.filter((row) => row.status === 'cancelled').length,
    };

    const recentBookings = [...reportRows]
      .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime())
      .slice(0, 8)
      .map((row) => ({
        bookingId: row.bookingId,
        customerName: row.customerName,
        totalAmount: row.totalAmount,
        status: row.status,
        createdAt: row.checkInDate,
      }));

    return {
      month: safeMonth,
      year: safeYear,
      kpis: {
        totalRevenue,
        totalBookings,
        totalCancelledBookings,
        averageBookingValue,
      },
      trends: {
        totalRevenue: this.calculateTrend(totalRevenue, previousRevenue),
        totalBookings: this.calculateTrend(totalBookings, previousBookings),
        totalCancelledBookings: this.calculateTrend(totalCancelledBookings, previousCancelled),
        averageBookingValue: this.calculateTrend(averageBookingValue, previousAverage),
      },
      revenueByDay: Array.from(revenueByDayMap.entries()).map(([day, revenue]) => ({ day, revenue })),
      statusDistribution,
      recentBookings,
    };
  }

  getBookingById(bookingId) {
    const booking = this.findRawBooking(bookingId);
    return booking ? this.toAdminBooking(booking) : null;
  }

  updateBooking(bookingId, payload = {}) {
    const booking = this.findRawBooking(bookingId);
    if (!booking) {
      return null;
    }

    if (typeof payload.customerName === 'string') {
      booking.guest_name = payload.customerName.trim();
    }

    if (typeof payload.phone === 'string') {
      booking.guest_phone = payload.phone.trim();
    }

    if (typeof payload.roomType === 'string') {
      booking.room_type = payload.roomType.trim();
    }

    if (typeof payload.checkInDate === 'string') {
      booking.check_in = payload.checkInDate;
    }

    if (typeof payload.checkOutDate === 'string') {
      booking.check_out = payload.checkOutDate;
    }

    if (payload.depositAmount !== undefined) {
      booking.depositAmount = this.toAmount(payload.depositAmount);
    }

    return this.toAdminBooking(booking);
  }

  updateStatus(bookingId, status) {
    const booking = this.findRawBooking(bookingId);
    if (!booking) {
      return null;
    }

    const nextStatus = this.normalizeStatus(status);
    if (!['pending', 'confirmed', 'cancelled'].includes(nextStatus)) {
      throw new Error('Invalid status');
    }

    const currentStatus = this.normalizeStatus(booking.status);
    if (currentStatus === 'cancelled' && nextStatus !== 'cancelled') {
      throw new Error('Cancelled booking cannot move to another status');
    }

    booking.status = nextStatus;

    return this.toAdminBooking(booking);
  }

  addExtraServices(bookingId, services = []) {
    const booking = this.findRawBooking(bookingId);
    if (!booking) {
      return null;
    }

    const normalizedServices = Array.isArray(services)
      ? services
          .map((service) => ({
            name: typeof service.name === 'string' ? service.name.trim() : '',
            amount: this.toAmount(service.amount),
            createdAt: new Date().toISOString(),
          }))
          .filter((service) => service.name && service.amount > 0)
      : [];

    if (!Array.isArray(booking.extraServices)) {
      booking.extraServices = [];
    }

    booking.extraServices.push(...normalizedServices);
    const addedAmount = normalizedServices.reduce((sum, item) => sum + item.amount, 0);
    booking.extraCharge = this.toAmount(booking.extraCharge) + addedAmount;
    booking.totalPrice = this.toAmount(booking.totalPrice) + addedAmount;

    return this.toAdminBooking(booking);
  }

  cancelBooking(bookingId, reason = '') {
    const booking = this.findRawBooking(bookingId);
    if (!booking) {
      return null;
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      requested: true,
      reason: typeof reason === 'string' ? reason : '',
      requestedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
    };

    const depositAmount = this.toAmount(booking.depositAmount);
    if (depositAmount > 0) {
      const existingRequest = REFUND_REQUESTS_MOCK.find((item) => item.bookingId === booking._id && item.status === 'pending');
      if (!existingRequest) {
        REFUND_REQUESTS_MOCK.unshift({
          id: `RR-${Date.now()}`,
          bookingId: booking._id,
          customerName: booking.guest_name || '',
          phone: booking.guest_phone || '',
          depositAmount,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }
    }

    return this.toAdminBooking(booking);
  }

  listRefundRequests(status = 'all') {
    return REFUND_REQUESTS_MOCK.filter((item) => (status === 'all' ? true : item.status === status));
  }

  confirmRefund(bookingId, note = '') {
    const booking = this.findRawBooking(bookingId);
    if (!booking) {
      return null;
    }

    const request = REFUND_REQUESTS_MOCK.find((item) => item.bookingId === bookingId && item.status === 'pending');
    if (!request) {
      throw new Error('Refund request not found');
    }

    return this.processRefundRequest({
      booking,
      request,
      refundStatus: 'confirmed',
      note,
    });
  }

  rejectRefund(bookingId, note = '') {
    const booking = this.findRawBooking(bookingId);
    if (!booking) {
      return null;
    }

    const request = REFUND_REQUESTS_MOCK.find((item) => item.bookingId === bookingId && item.status === 'pending');
    if (!request) {
      throw new Error('Refund request not found');
    }

    return this.processRefundRequest({
      booking,
      request,
      refundStatus: 'rejected',
      note,
    });
  }

  processRefundRequest({ booking, request, refundStatus, note }) {
    const refundAmount = this.toAmount(request.depositAmount);
    if (refundAmount <= 0) {
      throw new Error('Refund can only be processed when depositAmount > 0');
    }

    request.status = refundStatus;
    request.note = note;
    request.processedAt = new Date().toISOString();

    booking.status = 'cancelled';
    if (refundStatus === 'confirmed') {
      booking.payment = 'Refunded';
    }
    booking.refund = {
      status: refundStatus,
      amount: refundAmount,
      processedAt: request.processedAt,
      note,
    };

    return {
      refund: request,
      booking: this.toAdminBooking(booking),
    };
  }

  findRawBooking(bookingId) {
    return BOOKINGS_MOCK.find((item) => item._id === bookingId) || null;
  }

  toAdminBooking(booking) {
    const status = this.normalizeStatus(booking.status);

    return {
      bookingId: booking._id,
      customerName: booking.guest_name || '',
      phone: booking.guest_phone || '',
      roomType: booking.room_type || '',
      checkInDate: booking.check_in,
      checkOutDate: booking.check_out,
      status,
      totalAmount: this.toAmount(booking.totalPrice),
      depositAmount: this.toAmount(booking.depositAmount),
      createdAt: booking.createdAt,
      extraServices: Array.isArray(booking.extraServices) ? booking.extraServices : [],
      cancellation: booking.cancellation || {
        requested: status === 'cancelled',
        reason: '',
        requestedAt: '',
        approvedAt: '',
      },
      refund: booking.refund || {
        status: 'none',
        amount: 0,
        processedAt: '',
        note: '',
      },
    };
  }

  normalizeStatus(status) {
    if (status === 'cancelled') {
      return 'cancelled';
    }
    if (status === 'pending') {
      return 'pending';
    }
    return 'confirmed';
  }

  getPreviousMonthYear(month, year) {
    if (month === 1) {
      return { month: 12, year: year - 1 };
    }

    return { month: month - 1, year };
  }

  calculateTrend(current, previous) {
    if (!Number.isFinite(previous) || previous === 0) {
      if (!Number.isFinite(current) || current === 0) {
        return { percentage: 0, trend: 'up' };
      }

      return { percentage: 100, trend: 'up' };
    }

    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.round(Math.abs(change)),
      trend: change >= 0 ? 'up' : 'down',
    };
  }

  toAmount(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}

module.exports = {
  AdminBookingService,
};
