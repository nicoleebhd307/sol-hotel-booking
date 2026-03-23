const crypto = require('crypto');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { daysBetweenUtc } = require('../utils/dateUtils');
const { buildIdConditions } = require('./bookingService');

function makeRefundId() {
  return `refund_${crypto.randomBytes(10).toString('hex')}`;
}

function getEnvNumber(key, fallback) {
  const raw = process.env[key];
  const parsed = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function calculateRefundAmount({ depositAmount, daysBeforeCheckIn }) {
  const refundPercent = getEnvNumber('CANCEL_REFUND_PERCENT', 50);
  const refundBeforeDays = getEnvNumber('CANCEL_REFUND_BEFORE_DAYS', 7);

  if (daysBeforeCheckIn <= refundBeforeDays) return 0;
  return Math.round((depositAmount * refundPercent) / 100);
}

async function processGatewayRefundStub({ amount }) {
  if (amount <= 0) {
    return { status: 'skipped', refundId: null };
  }

  return { status: 'success', refundId: makeRefundId() };
}

async function cancelBookingWithPolicy({ bookingId }) {
  if (!mongoose.isValidObjectId(bookingId)) {
    const err = new Error('Invalid bookingId');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();

  const booking = await Booking.findOne(buildIdConditions(bookingId));
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  // When completing a refund, the booking is already cancelled with awaiting_refund status — skip the check
  if (booking.status === 'cancelled' && booking.refund_status !== 'awaiting_refund') {
    const err = new Error('Booking already cancelled');
    err.statusCode = 409;
    throw err;
  }

  const daysBeforeCheckIn = daysBetweenUtc(now, booking.check_in);
  const refundAmount = calculateRefundAmount({
    depositAmount: booking.depositAmount,
    daysBeforeCheckIn
  });

  const latestSuccessfulPayment = await Payment.findOne({
    bookingId: booking._id,
    paymentStatus: 'success'
  })
    .sort({ createdAt: -1 })
    .lean();

  if (refundAmount > 0 && !latestSuccessfulPayment) {
    const err = new Error('No successful payment found to refund');
    err.statusCode = 409;
    throw err;
  }

  const gatewayRefund = await processGatewayRefundStub({ amount: refundAmount });

  if (refundAmount > 0 && gatewayRefund.status !== 'success') {
    const err = new Error('Refund failed');
    err.statusCode = 502;
    throw err;
  }

  await Booking.findOneAndUpdate({ _id: booking._id }, {
    $set: {
      status: 'cancelled',
      cancelledAt: now,
      refund_status: refundAmount > 0 ? 'refunded' : booking.refund_status
    }
  });

  if (refundAmount > 0) {
    await Payment.findByIdAndUpdate(latestSuccessfulPayment._id, {
      $set: {
        paymentStatus: 'refunded',
        transactionId: latestSuccessfulPayment.transactionId || gatewayRefund.refundId
      }
    });
  }

  const updatedBooking = await Booking.findOne({ _id: booking._id })
    .populate('customer_id')
    .populate({ path: 'rooms.room_id', populate: { path: 'room_type_id' } })
    .lean();

  return {
    booking: updatedBooking,
    refund: {
      daysBeforeCheckIn,
      refundAmount,
      refundId: gatewayRefund.refundId || null
    }
  };
}

module.exports = {
  cancelBookingWithPolicy,
  calculateRefundAmount
};
