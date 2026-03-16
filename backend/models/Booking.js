const mongoose = require('mongoose');

const BookingRoomSchema = new mongoose.Schema(
  {
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    price_per_night: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    rooms: { type: [BookingRoomSchema], required: true, default: [] },
    check_in: { type: Date, required: true, index: true },
    check_out: { type: Date, required: true, index: true },
    guests: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    depositAmount: { type: Number, required: true, min: 0 },
    extraCharge: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out', 'completed'],
      default: 'pending',
      index: true
    },
    note: { type: String, default: '' },
    holdExpiresAt: { type: Date, index: true },
    refund_status: { type: String, enum: ['none', 'refunded'], default: 'none' },
    cancelledAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
  },
  {
    collection: 'bookings'
  }
);

BookingSchema.index({ check_in: 1, check_out: 1, status: 1 });
BookingSchema.index({ 'rooms.room_id': 1, check_in: 1, check_out: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
