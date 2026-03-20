const bookingService = require('../services/bookingService');
const refundService = require('../services/refundService');

async function searchBookings(req, res, next) {
  try {
    const { query } = req.params;
    const bookings = await bookingService.searchBookings(query);
    return res.json(bookings);
  } catch (err) {
    return next(err);
  }
}

async function createBooking(req, res, next) {
  try {
    const { customer, roomIds, check_in, check_out, guests, note } = req.body || {};

    const booking = await bookingService.createBooking({
      customer,
      roomIds,
      checkIn: check_in,
      checkOut: check_out,
      guests,
      note
    });

    return res.status(201).json(booking);
  } catch (err) {
    return next(err);
  }
}

async function getBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { email } = req.query;

    const { booking, payment } = await bookingService.getBookingById(id);
    await bookingService.assertGuestCanAccess({ booking, customerEmail: email });

    return res.json({ booking, payment });
  } catch (err) {
    return next(err);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { email } = req.body || {};

    const { booking } = await bookingService.getBookingById(id);
    await bookingService.assertGuestCanAccess({ booking, customerEmail: email });

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

module.exports = {
  searchBookings,
  createBooking,
  getBooking,
  cancelBooking
};
