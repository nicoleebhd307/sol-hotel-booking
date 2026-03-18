const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true, trim: true },
    paymentStatus: { type: String, required: true, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending', index: true },
    transactionId: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
  },
  {
    collection: 'payments'
  }
);

module.exports = mongoose.model('Payment', PaymentSchema);
