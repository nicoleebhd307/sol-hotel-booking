const crypto = require('crypto');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

function makeTransactionId() {
  return crypto.randomBytes(12).toString('hex');
}

function getGatewayMode() {
  return process.env.PAYMENT_GATEWAY_MODE || 'stub';
}

async function processGatewayCharge({ amount, paymentMethod, simulateStatus }) {
  const mode = getGatewayMode();

  if (mode !== 'stub') {
    const err = new Error('Only stub gateway is configured');
    err.statusCode = 500;
    throw err;
  }

  const status = simulateStatus === 'failed' ? 'failed' : 'success';

  return {
    status,
    transactionId: makeTransactionId(),
    raw: { mode, paymentMethod }
  };
}

function sendBookingConfirmationEmailStub({ bookingId, toEmail }) {
  if (!toEmail) return;
  // eslint-disable-next-line no-console
  console.log(`[EMAIL][stub] Booking confirmation sent to ${toEmail} for booking ${bookingId}`);
}

async function payDeposit({ bookingId, paymentMethod, simulateStatus }) {
  if (!mongoose.isValidObjectId(bookingId)) {
    const err = new Error('Invalid bookingId');
    err.statusCode = 400;
    throw err;
  }

  if (!paymentMethod) {
    const err = new Error('paymentMethod is required');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  const booking = await Booking.findById(bookingId).populate('customer_id');
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  if (booking.status === 'cancelled') {
    const err = new Error('Booking is cancelled');
    err.statusCode = 409;
    throw err;
  }

  if (booking.status === 'confirmed') {
    const existing = await Payment.findOne({ bookingId: booking._id, paymentStatus: 'success' }).lean();
    if (existing) {
      const err = new Error('Booking already paid');
      err.statusCode = 409;
      throw err;
    }
  }

  if (booking.status === 'pending') {
    if (booking.holdExpiresAt && booking.holdExpiresAt <= now) {
      await Booking.findByIdAndUpdate(booking._id, { $set: { status: 'cancelled', cancelledAt: now } });
      const err = new Error('Payment hold expired');
      err.statusCode = 409;
      throw err;
    }
  }

  const payment = await Payment.create({
    bookingId: booking._id,
    amount: booking.depositAmount,
    paymentMethod,
    paymentStatus: 'pending'
  });

  const gatewayResult = await processGatewayCharge({
    amount: booking.depositAmount,
    paymentMethod,
    simulateStatus
  });

  const finalStatus = gatewayResult.status === 'success' ? 'success' : 'failed';

  await Payment.findByIdAndUpdate(payment._id, {
    $set: {
      paymentStatus: finalStatus,
      transactionId: gatewayResult.transactionId
    }
  });

  if (finalStatus === 'success') {
    await Booking.findByIdAndUpdate(booking._id, {
      $set: { status: 'confirmed', holdExpiresAt: null }
    });

    sendBookingConfirmationEmailStub({ bookingId: booking._id, toEmail: booking.customer_id?.email });
  }

  const updatedBooking = await Booking.findById(booking._id)
    .populate('customer_id')
    .populate({ path: 'rooms.room_id', populate: { path: 'room_type_id' } })
    .lean();

  const updatedPayment = await Payment.findById(payment._id).lean();

  return { booking: updatedBooking, payment: updatedPayment };
}

module.exports = {
  payDeposit,
  processGatewayCharge
};
