const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const Staff = require('../models/Staff');
const Booking = require('../models/Booking');
const bookingService = require('../services/bookingService');
const refundService = require('../services/refundService');
const { buildIdConditions } = require('../services/bookingService');

function signToken({ staffId, accountId, role }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error('JWT_SECRET is required');
    err.statusCode = 500;
    throw err;
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '12h';
  return jwt.sign({ staffId, accountId, role }, secret, { expiresIn });
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    const userTrimmed = String(username).trim();
    // Try both username and email fields (DB may use either)
    const account = await Account.findOne({
      $or: [{ username: userTrimmed }, { email: userTrimmed.toLowerCase() }]
    });
    if (!account) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (account.status !== 'active') {
      return res.status(403).json({ message: 'Account disabled' });
    }

    // Support both hashed (passwordHash) and legacy plaintext (password) fields
    const storedHash = account.passwordHash;
    const storedPlain = account.password;
    let ok = false;
    if (storedHash) {
      ok = await bcrypt.compare(String(password), storedHash);
    } else if (storedPlain) {
      ok = String(password) === String(storedPlain);
    }
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const staff = await Staff.findOne({
      $or: [
        { account_id: account._id },
        { account_id: String(account._id) }
      ]
    }).lean();
    if (!staff) {
      return res.status(403).json({ message: 'Staff record not found' });
    }

    const token = signToken({ staffId: staff._id, accountId: account._id, role: staff.role });

    return res.json({
      token,
      staff: {
        id: staff._id,
        role: staff.role,
        name: staff.name,
        email: staff.email
      }
    });
  } catch (err) {
    return next(err);
  }
}

async function listBookings(req, res, next) {
  try {
    const { status, from, to, limit, skip } = req.query;
    const items = await bookingService.listBookings({ status, from, to, limit, skip });
    return res.json({ count: items.length, items });
  } catch (err) {
    return next(err);
  }
}

async function getBookingDetails(req, res, next) {
  try {
    const { id } = req.params;
    const data = await bookingService.getBookingById(id);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

// --- Admin FE compatible endpoints (return {success, data} format) ---

function formatAdminBooking(booking, payment) {
  const customer = booking.customer_id || {};
  const room = booking.rooms?.[0]?.room_id;
  const roomType = room?.room_type_id || room;
  return {
    bookingId: String(booking._id),
    customerName: customer.name || '',
    phone: customer.phone || '',
    roomType: roomType?.name || '',
    checkInDate: booking.check_in ? new Date(booking.check_in).toISOString().slice(0, 10) : '',
    checkOutDate: booking.check_out ? new Date(booking.check_out).toISOString().slice(0, 10) : '',
    status: booking.status || 'pending',
    totalAmount: booking.totalPrice || 0,
    depositAmount: booking.depositAmount || 0,
    createdAt: booking.createdAt ? new Date(booking.createdAt).toISOString() : '',
    extraServices: (booking.extraServices || []).map(s => ({
      name: s.name || '',
      amount: s.amount || 0,
      createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : '',
    })),
    cancellation: {
      requested: booking.status === 'cancelled',
      reason: booking.note || '',
      requestedAt: booking.cancelledAt ? new Date(booking.cancelledAt).toISOString() : '',
      approvedAt: booking.cancelledAt ? new Date(booking.cancelledAt).toISOString() : '',
    },
    refund: {
      status: booking.refund_status || 'none',
      amount: (payment && payment.paymentStatus === 'refunded') ? payment.amount : 0,
      processedAt: '',
      note: '',
    },
  };
}

// Statuses managed in booking management (only paid/confirmed bookings)
const MANAGED_STATUSES = ['confirmed', 'checked_in', 'checked_out', 'completed'];

async function listBookingsForAdminFE(req, res, next) {
  try {
    // Auto-cancel any pending bookings whose 30-min hold has expired
    await bookingService.expireStalePendingBookings();

    const { status, date, search } = req.query;
    const query = {};
    // Default: only show active/paid bookings. Allow explicit status override for internal use.
    if (status && status !== 'all') {
      query.status = status;
    } else {
      query.status = { $in: MANAGED_STATUSES };
    }
    if (date) {
      const dayStart = new Date(date);
      if (!isNaN(dayStart.getTime())) {
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: dayStart, $lt: dayEnd };
      }
    }

    let items = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('customer_id')
      .populate({ path: 'rooms.room_id', populate: { path: 'room_type_id' } })
      .lean();

    if (search) {
      const s = search.toLowerCase();
      items = items.filter(b => {
        const name = (b.customer_id?.name || '').toLowerCase();
        const phone = (b.customer_id?.phone || '').toLowerCase();
        const id = String(b._id).toLowerCase();
        return name.includes(s) || phone.includes(s) || id.includes(s);
      });
    }

    const data = items.map(b => formatAdminBooking(b, null));
    const totalRevenue = items.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const totalDeposits = items.reduce((s, b) => s + (b.depositAmount || 0), 0);

    return res.json({
      success: true,
      data,
      summary: {
        totalBookings: data.length,
        totalRevenue,
        totalDeposits,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getBookingDetailForAdminFE(req, res, next) {
  try {
    const { id } = req.params;
    const { booking, payment } = await bookingService.getBookingById(id);
    return res.json({ success: true, data: formatAdminBooking(booking, payment) });
  } catch (err) {
    return next(err);
  }
}

async function updateBookingForAdminFE(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const { booking } = await bookingService.getBookingById(id);

    const setFields = {};
    if (updates.customerName !== undefined || updates.phone !== undefined) {
      const Customer = require('../models/Customer');
      const cust = await Customer.findById(booking.customer_id?._id || booking.customer_id);
      if (cust) {
        if (updates.customerName) cust.name = updates.customerName;
        if (updates.phone) cust.phone = updates.phone;
        await cust.save();
      }
    }
    if (updates.checkInDate) setFields.check_in = new Date(updates.checkInDate);
    if (updates.checkOutDate) setFields.check_out = new Date(updates.checkOutDate);
    if (updates.depositAmount !== undefined) setFields.depositAmount = Number(updates.depositAmount);

    if (Object.keys(setFields).length > 0) {
      await Booking.findOneAndUpdate(buildIdConditions(id), { $set: setFields });
    }

    const updated = await bookingService.getBookingById(id);
    return res.json({ success: true, data: formatAdminBooking(updated.booking, updated.payment) });
  } catch (err) {
    return next(err);
  }
}

async function updateBookingStatusForAdminFE(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    await bookingService.adminUpdateBookingStatus(id, status);
    const updated = await bookingService.getBookingById(id);
    return res.json({ success: true, data: formatAdminBooking(updated.booking, updated.payment) });
  } catch (err) {
    return next(err);
  }
}

async function addExtraServicesForAdminFE(req, res, next) {
  try {
    const { id } = req.params;
    const { services } = req.body || {};
    if (!Array.isArray(services)) {
      return res.status(400).json({ success: false, message: 'services array is required' });
    }
    const totalExtra = services.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    await bookingService.adminAddExtraCharges(id, totalExtra);

    // Store extra services detail in the booking
    const extraServices = services.map(s => ({
      name: s.name || '',
      amount: Number(s.amount) || 0,
      createdAt: new Date(),
    }));
    await Booking.findOneAndUpdate(buildIdConditions(id), { $push: { extraServices: { $each: extraServices } } });

    const updated = await bookingService.getBookingById(id);
    return res.json({ success: true, data: formatAdminBooking(updated.booking, updated.payment) });
  } catch (err) {
    return next(err);
  }
}

async function cancelBookingForAdminFE(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const { booking } = await bookingService.getBookingById(id);

    if (booking.status === 'cancelled') {
      return res.status(409).json({ success: false, message: 'Booking already cancelled' });
    }

    if (booking.status === 'pending') {
      await bookingService.cancelPendingWithoutRefund(id);
    } else if (booking.depositAmount > 0) {
      // Confirmed booking with deposit → cancel and create refund request for manager
      await Booking.findOneAndUpdate(buildIdConditions(id), {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
          refund_status: 'pending',
        }
      });
    } else {
      // Confirmed booking without deposit → simple cancel
      await Booking.findOneAndUpdate(buildIdConditions(id), {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date(),
        }
      });
    }

    if (reason) {
      await Booking.findOneAndUpdate(buildIdConditions(id), { $set: { note: reason } });
    }

    const updated = await bookingService.getBookingById(id);
    return res.json({ success: true, data: formatAdminBooking(updated.booking, updated.payment) });
  } catch (err) {
    return next(err);
  }
}

async function getRefundRequests(req, res, next) {
  try {
    const { status } = req.query;
    const query = { status: 'cancelled' };
    if (status && status !== 'all') {
      if (status === 'confirmed') {
        query.refund_status = 'refunded';
      } else if (status === 'awaiting_refund') {
        query.refund_status = 'awaiting_refund';
      } else if (status === 'pending') {
        query.refund_status = 'pending';
      } else if (status === 'rejected') {
        query.refund_status = 'none';
      } else {
        query.refund_status = status;
      }
    }

    const bookings = await Booking.find(query)
      .sort({ cancelledAt: -1 })
      .limit(200)
      .populate('customer_id')
      .lean();

    const data = bookings
      .filter(b => b.depositAmount > 0)
      .map(b => {
        let mappedStatus = 'pending';
        if (b.refund_status === 'refunded') mappedStatus = 'confirmed';
        else if (b.refund_status === 'awaiting_refund') mappedStatus = 'awaiting_refund';
        else if (b.refund_status === 'pending') mappedStatus = 'pending';
        else if (b.refund_status === 'none') mappedStatus = 'rejected';

        return {
          id: String(b._id),
          bookingId: String(b._id),
          customerName: b.customer_id?.name || '',
          phone: b.customer_id?.phone || '',
          depositAmount: b.depositAmount || 0,
          status: mappedStatus,
          createdAt: b.cancelledAt ? new Date(b.cancelledAt).toISOString() : '',
          processedAt: '',
          note: b.note || '',
        };
      });

    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
}

async function confirmRefund(req, res, next) {
  try {
    const { id } = req.params;
    const { note } = req.body || {};

    // Manager approves refund → set to awaiting_refund (waiting for actual money transfer)
    await Booking.findOneAndUpdate(buildIdConditions(id), {
      $set: {
        refund_status: 'awaiting_refund',
        ...(note ? { note } : {}),
      }
    });

    const updated = await bookingService.getBookingById(id);
    refundService.sendRefundStatusEmailStub({
      toEmail: updated.booking.customer_id?.email,
      bookingId: id,
      status: 'refund_approved_waiting_transfer',
      refundAmount: 0,
      note: note || ''
    });
    return res.json({
      success: true,
      data: {
        refund: {
          id: String(id),
          bookingId: String(id),
          customerName: updated.booking.customer_id?.name || '',
          phone: updated.booking.customer_id?.phone || '',
          depositAmount: updated.booking.depositAmount || 0,
          status: 'awaiting_refund',
          createdAt: updated.booking.cancelledAt ? new Date(updated.booking.cancelledAt).toISOString() : '',
          processedAt: new Date().toISOString(),
          note: note || '',
        },
        booking: formatAdminBooking(updated.booking, updated.payment),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function rejectRefund(req, res, next) {
  try {
    const { id } = req.params;
    const { note } = req.body || {};
    await Booking.findOneAndUpdate(buildIdConditions(id), { $set: { refund_status: 'none', note: note || '' } });
    const updated = await bookingService.getBookingById(id);
    refundService.sendRefundStatusEmailStub({
      toEmail: updated.booking.customer_id?.email,
      bookingId: id,
      status: 'refund_rejected',
      refundAmount: 0,
      note: note || ''
    });
    return res.json({
      success: true,
      data: {
        refund: {
          id: String(id),
          bookingId: String(id),
          customerName: updated.booking.customer_id?.name || '',
          phone: updated.booking.customer_id?.phone || '',
          depositAmount: updated.booking.depositAmount || 0,
          status: 'rejected',
          createdAt: updated.booking.cancelledAt ? new Date(updated.booking.cancelledAt).toISOString() : '',
          processedAt: new Date().toISOString(),
          note: note || '',
        },
        booking: formatAdminBooking(updated.booking, updated.payment),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function completeRefund(req, res, next) {
  try {
    const { id } = req.params;
    const { note } = req.body || {};

    const booking = await Booking.findOne(buildIdConditions(id));
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.refund_status !== 'awaiting_refund') {
      return res.status(409).json({ success: false, message: 'Refund is not in awaiting state' });
    }

    // Process the actual refund via refund service
    const refundResult = await refundService.cancelBookingWithPolicy({ bookingId: booking._id });

    if (note) {
      await Booking.findOneAndUpdate(buildIdConditions(id), { $set: { note } });
    }

    const updated = await bookingService.getBookingById(id);
    refundService.sendRefundStatusEmailStub({
      toEmail: updated.booking.customer_id?.email,
      bookingId: id,
      status: 'refund_completed',
      refundAmount: refundResult?.refund?.refundAmount || 0,
      note: note || ''
    });
    return res.json({
      success: true,
      data: {
        refund: {
          id: String(id),
          bookingId: String(id),
          customerName: updated.booking.customer_id?.name || '',
          phone: updated.booking.customer_id?.phone || '',
          depositAmount: updated.booking.depositAmount || 0,
          status: 'confirmed',
          createdAt: updated.booking.cancelledAt ? new Date(updated.booking.cancelledAt).toISOString() : '',
          processedAt: new Date().toISOString(),
          note: note || '',
        },
        booking: formatAdminBooking(updated.booking, updated.payment),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getReports(req, res, next) {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const daysInMonth = endDate.getDate();

    const bookings = await Booking.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate('customer_id')
      .lean();

    const totalRevenue = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
    const totalBookings = bookings.length;
    const totalCancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const averageBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

    const revenueByDay = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStart = new Date(year, month - 1, d);
      const dayEnd = new Date(year, month - 1, d + 1);
      const dayRevenue = bookings
        .filter(b => new Date(b.createdAt) >= dayStart && new Date(b.createdAt) < dayEnd)
        .reduce((s, b) => s + (b.totalPrice || 0), 0);
      revenueByDay.push({ day: d, revenue: dayRevenue });
    }

    const statusDistribution = {
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      cancelled: totalCancelledBookings,
    };

    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(b => ({
        bookingId: String(b._id),
        customerName: b.customer_id?.name || '',
        totalAmount: b.totalPrice || 0,
        status: b.status,
        createdAt: new Date(b.createdAt).toISOString(),
      }));

    return res.json({
      success: true,
      data: {
        month,
        year,
        kpis: { totalRevenue, totalBookings, totalCancelledBookings, averageBookingValue },
        trends: {
          totalRevenue: { percentage: 5, trend: 'up' },
          totalBookings: { percentage: 3, trend: 'up' },
          totalCancelledBookings: { percentage: -2, trend: 'down' },
          averageBookingValue: { percentage: 1, trend: 'up' },
        },
        revenueByDay,
        statusDistribution,
        recentBookings,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function createManualBooking(req, res, next) {
  try {
    const { customer, roomIds, check_in, check_out, guests, note, confirmImmediately } = req.body || {};

    const booking = await bookingService.createManualBooking({
      customer,
      roomIds,
      checkIn: check_in,
      checkOut: check_out,
      guests,
      note,
      confirmImmediately: Boolean(confirmImmediately)
    });

    return res.status(201).json(booking);
  } catch (err) {
    return next(err);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;

    const { booking } = await bookingService.getBookingById(id);

    if (booking.status === 'pending') {
      const cancelled = await bookingService.cancelPendingWithoutRefund(id);
      return res.json({ booking: cancelled, refund: { refundAmount: 0 } });
    }

    const result = await refundService.cancelBookingWithPolicy({ bookingId: id });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function confirmCheckIn(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await bookingService.adminUpdateBookingStatus(id, 'checked_in');
    return res.json({ booking: updated });
  } catch (err) {
    return next(err);
  }
}

async function confirmCheckOut(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await bookingService.adminUpdateBookingStatus(id, 'checked_out');
    return res.json({ booking: updated });
  } catch (err) {
    return next(err);
  }
}

async function addExtraCharges(req, res, next) {
  try {
    const { id } = req.params;
    const { extraCharge } = req.body || {};
    const updated = await bookingService.adminAddExtraCharges(id, extraCharge);
    return res.json({ booking: updated });
  } catch (err) {
    return next(err);
  }
}

async function addNote(req, res, next) {
  try {
    const { id } = req.params;
    const { note } = req.body || {};
    const updated = await bookingService.adminAddNote(id, note);
    return res.json({ booking: updated });
  } catch (err) {
    return next(err);
  }
}

async function getRoomCalendar(req, res, next) {
  try {
    const { roomId, from, to } = req.query;
    const items = await bookingService.getRoomCalendar({ roomId, from, to });
    return res.json({ count: items.length, items });
  } catch (err) {
    return next(err);
  }
}

async function getBookingStats(req, res, next) {
  try {
    const { from, to } = req.query;
    const stats = await bookingService.getBookingStats({ from, to });
    return res.json(stats);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
  listBookings,
  getBookingDetails,
  createManualBooking,
  cancelBooking,
  confirmCheckIn,
  confirmCheckOut,
  addExtraCharges,
  addNote,
  getRoomCalendar,
  getBookingStats,
  // Admin FE compatible endpoints
  listBookingsForAdminFE,
  getBookingDetailForAdminFE,
  updateBookingForAdminFE,
  updateBookingStatusForAdminFE,
  addExtraServicesForAdminFE,
  cancelBookingForAdminFE,
  getRefundRequests,
  confirmRefund,
  rejectRefund,
  completeRefund,
  getReports,
};
