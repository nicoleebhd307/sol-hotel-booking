const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { buildPaymentUrl, verifyReturnUrl } = require('../utils/vnpay');

/**
 * Create a VNPay payment URL for a booking's deposit.
 *
 * Flow:
 *   1. Validate booking exists and is in payable state
 *   2. Create a Payment record with status 'pending'
 *   3. Build VNPay redirect URL using the payment _id as txnRef
 *   4. Return the URL for the client to redirect to
 */
async function createVnpayPaymentUrl({ bookingId, ipAddress }) {
  if (!mongoose.isValidObjectId(bookingId)) {
    const err = new Error('Invalid bookingId');
    err.statusCode = 400;
    throw err;
  }

  const objectId = new mongoose.Types.ObjectId(bookingId);
  const booking = await Booking.findById(objectId);
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  // Only pending bookings can be paid
  if (booking.status !== 'pending') {
    const err = new Error(`Booking status is "${booking.status}", cannot pay deposit`);
    err.statusCode = 409;
    throw err;
  }

  // Check hold expiry
  const now = new Date();
  if (booking.holdExpiresAt && booking.holdExpiresAt <= now) {
    await Booking.findByIdAndUpdate(booking._id, {
      $set: { status: 'cancelled', cancelledAt: now }
    });
    const err = new Error('Payment hold expired, booking has been cancelled');
    err.statusCode = 409;
    throw err;
  }

  // Prevent duplicate pending VNPay payments
  const existingPending = await Payment.findOne({
    bookingId: booking._id,
    paymentMethod: 'vnpay',
    paymentStatus: 'pending',
  });
  if (existingPending) {
    // Mark old pending payment as failed before creating a new one
    await Payment.findByIdAndUpdate(existingPending._id, {
      $set: { paymentStatus: 'failed' }
    });
  }

  // Create a new payment record
  const payment = await Payment.create({
    bookingId: booking._id,
    amount: booking.depositAmount,
    paymentMethod: 'vnpay',
    paymentStatus: 'pending',
  });

  // Use payment _id as the VNPay txnRef for easy lookup on return
  const paymentUrl = buildPaymentUrl({
    orderId: payment._id.toString(),
    amount: booking.depositAmount,
    orderInfo: `Thanh toan dat coc booking ${booking._id}`,
    ipAddress: ipAddress || '127.0.0.1',
  });

  return { paymentUrl, paymentId: payment._id };
}

/**
 * Process the VNPay return redirect.
 *
 * Flow:
 *   1. Verify vnp_SecureHash
 *   2. Find the Payment by txnRef
 *   3. Update Payment + Booking status based on responseCode
 *   4. Return result for the controller to redirect
 */
async function handleVnpayReturn(query) {
  const { isValid, responseCode, txnRef, amount, transactionNo } = verifyReturnUrl(query);

  if (!isValid) {
    return { success: false, isSignatureValid: false, message: 'Invalid signature' };
  }

  // txnRef is the payment _id
  const payment = await Payment.findById(txnRef);
  if (!payment) {
    return { success: false, isSignatureValid: true, paymentFound: false, message: 'Payment not found' };
  }

  // Prevent re-processing already finalized payments
  if (payment.paymentStatus === 'success' || payment.paymentStatus === 'failed') {
    return {
      success: payment.paymentStatus === 'success',
      isSignatureValid: true,
      paymentFound: true,
      alreadyProcessed: true,
      message: `Payment already ${payment.paymentStatus}`,
      bookingId: payment.bookingId,
    };
  }

  // responseCode "00" = success
  if (responseCode === '00') {
    await Payment.findByIdAndUpdate(payment._id, {
      $set: {
        paymentStatus: 'success',
        transactionId: transactionNo,
      },
    });

    await Booking.findByIdAndUpdate(payment.bookingId, {
      $set: { status: 'confirmed', holdExpiresAt: null },
    });

    return {
      success: true,
      isSignatureValid: true,
      paymentFound: true,
      alreadyProcessed: false,
      message: 'Payment successful',
      bookingId: payment.bookingId,
    };
  }

  // Any other responseCode = failed
  await Payment.findByIdAndUpdate(payment._id, {
    $set: {
      paymentStatus: 'failed',
      transactionId: transactionNo || undefined,
    },
  });

  return {
    success: false,
    isSignatureValid: true,
    paymentFound: true,
    alreadyProcessed: false,
    message: `Payment failed (VNPay code: ${responseCode})`,
    bookingId: payment.bookingId,
  };
}

module.exports = {
  createVnpayPaymentUrl,
  handleVnpayReturn,
};
