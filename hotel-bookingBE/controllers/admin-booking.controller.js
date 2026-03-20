class AdminBookingController {
  constructor(service) {
    this.service = service;
  }

  listBookings = (req, res) => {
    const bookings = this.service.listBookings({
      status: req.query.status,
      date: req.query.date,
      search: req.query.search,
    });

    return res.json({
      success: true,
      data: bookings,
      summary: this.service.getDashboardSummary({
        status: req.query.status,
        date: req.query.date,
        search: req.query.search,
      }),
    });
  };

  getReports = (req, res) => {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    return res.json({
      success: true,
      data: this.service.getReports({ month, year }),
    });
  };

  getBookingDetail = (req, res) => {
    const booking = this.service.getBookingById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.json({ success: true, data: booking });
  };

  updateBooking = (req, res) => {
    const booking = this.service.updateBooking(req.params.bookingId, req.body);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.json({ success: true, data: booking });
  };

  updateBookingStatus = (req, res) => {
    try {
      const booking = this.service.updateStatus(req.params.bookingId, req.body.status);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      return res.json({ success: true, data: booking });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  addExtraServices = (req, res) => {
    const booking = this.service.addExtraServices(req.params.bookingId, req.body.services);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.json({ success: true, data: booking });
  };

  cancelBooking = (req, res) => {
    const booking = this.service.cancelBooking(req.params.bookingId, req.body.reason);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.json({ success: true, data: booking });
  };

  listRefundRequests = (req, res) => {
    return res.json({
      success: true,
      data: this.service.listRefundRequests(req.query.status || 'all'),
    });
  };

  confirmRefund = (req, res) => {
    try {
      const result = this.service.confirmRefund(req.params.bookingId, req.body.note || '');
      if (!result) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      return res.json({ success: true, data: result });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };

  rejectRefund = (req, res) => {
    try {
      const result = this.service.rejectRefund(req.params.bookingId, req.body.note || '');
      if (!result) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      return res.json({ success: true, data: result });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  };
}

module.exports = {
  AdminBookingController,
};
