const bookingService = require('../services/bookingService');
const refundService = require('../services/refundService');
const Booking = require('../models/Booking');

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
      refundService.sendRefundStatusEmailStub({
        toEmail: booking.customer_id?.email,
        bookingId: id,
        status: 'cancelled_no_refund',
        refundAmount: 0,
        note: 'Pending booking cancelled by customer'
      });
      return res.json({
        booking: cancelled,
        refund: { refundAmount: 0, status: 'not_applicable' },
        message: 'Booking cancelled successfully.'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(409).json({ message: 'Booking already cancelled' });
    }

    const setFields = {
      status: 'cancelled',
      cancelledAt: new Date(),
      refund_status: booking.depositAmount > 0 ? 'pending' : 'none'
    };

    const updated = await Booking.findOneAndUpdate(
      bookingService.buildIdConditions(id),
      { $set: setFields },
      { new: true }
    )
      .populate('customer_id')
      .populate({ path: 'rooms.room_id', populate: { path: 'room_type_id' } })
      .lean();

    const requiresApproval = booking.depositAmount > 0;
    refundService.sendRefundStatusEmailStub({
      toEmail: updated?.customer_id?.email,
      bookingId: id,
      status: requiresApproval ? 'refund_request_pending_admin_approval' : 'cancelled_no_refund',
      refundAmount: 0,
      note: requiresApproval
        ? 'Cancellation request submitted. Please wait for admin approval.'
        : 'Booking cancelled with no refundable amount.'
    });

    return res.json({
      booking: updated,
      refund: {
        refundAmount: 0,
        status: requiresApproval ? 'pending_admin_approval' : 'not_applicable'
      },
      message: requiresApproval
        ? 'Cancellation request submitted. Please wait for admin approval.'
        : 'Booking cancelled successfully.'
    });
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
