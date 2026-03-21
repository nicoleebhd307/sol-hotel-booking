const crypto = require('crypto');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const momoV2Gateway = require('../payment/momo/momoV2Gateway');

function makeTransactionId() {
  return crypto.randomBytes(12).toString('hex');
}

function getGatewayMode() {
  return process.env.PAYMENT_GATEWAY_MODE || 'stub';
}

function buildBookingIdConditions(id) {
  const raw = String(id || '').trim();
  const conditions = [{ _id: raw }];

  if (mongoose.isValidObjectId(raw)) {
    conditions.push({ _id: new mongoose.Types.ObjectId(raw) });
  }

  return { $or: conditions };
}

function parseBookingIdFromOrderId(orderId) {
  if (!orderId || typeof orderId !== 'string') return '';
  if (!orderId.startsWith('BK_')) return '';

  const parts = orderId.split('_');
  if (parts.length < 3) return '';

  return parts.slice(1, -1).join('_');
}

async function getBookingForPayment(bookingId) {
  const normalizedId = String(bookingId || '').trim();
  if (!normalizedId) {
    const err = new Error('Invalid bookingId');
    err.statusCode = 400;
    throw err;
  }

  const booking = await Booking.findOne(buildBookingIdConditions(normalizedId)).populate('customer_id');
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

  return booking;
}

async function initMomoSession({ bookingId, channel, paymentCode }) {
  const booking = await getBookingForPayment(bookingId);
  return momoV2Gateway.createTestSession({ booking, channel, paymentCode });
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
  if (!paymentMethod) {
    const err = new Error('paymentMethod is required');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  const booking = await getBookingForPayment(bookingId);

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

async function handleMomoCallback({ payload }) {
  const orderId = String(payload?.orderId || '');
  const resultCode = Number(payload?.resultCode);
  const transId = String(payload?.transId || payload?.requestId || orderId || makeTransactionId());
  const bookingId = parseBookingIdFromOrderId(orderId);

  if (!bookingId) {
    const err = new Error('Invalid bookingId from MoMo callback');
    err.statusCode = 400;
    throw err;
  }

  const booking = await Booking.findOne(buildBookingIdConditions(bookingId)).populate('customer_id');
  if (!booking) {
    const err = new Error('Booking not found for MoMo callback');
    err.statusCode = 404;
    throw err;
  }

  const amountFromGateway = Number(payload?.amount);
  const paymentAmount = Number.isFinite(amountFromGateway) && amountFromGateway > 0
    ? amountFromGateway
    : booking.depositAmount;

  const finalStatus = resultCode === 0 ? 'success' : 'failed';

  const existingPayment = await Payment.findOne({
    bookingId: booking._id,
    paymentMethod: 'momo',
    transactionId: transId
  });

  if (existingPayment) {
    if (existingPayment.paymentStatus !== finalStatus) {
      existingPayment.paymentStatus = finalStatus;
      await existingPayment.save();
    }
  } else {
    await Payment.create({
      bookingId: booking._id,
      amount: paymentAmount,
      paymentMethod: 'momo',
      paymentStatus: finalStatus,
      transactionId: transId
    });
  }

  if (finalStatus === 'success' && booking.status !== 'confirmed') {
    booking.status = 'confirmed';
    booking.holdExpiresAt = null;
    await booking.save();

    if (booking.customer_id?.email) {
      sendBookingConfirmationEmailStub({ bookingId: booking._id, toEmail: booking.customer_id.email });
    }
  }

  return {
    bookingId: String(booking._id),
    status: finalStatus,
    resultCode,
    orderId,
    transactionId: transId
  };
}

module.exports = {
  initMomoSession,
  payDeposit,
  processGatewayCharge,
  handleMomoCallback
};
