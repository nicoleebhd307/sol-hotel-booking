const mongoose = require('mongoose');

const BookingDraftSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.Mixed, index: true },
    selectedRoomId: { type: String, default: '' },
    formValue: {
      phone: { type: String, default: '' },
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      identityNumber: { type: String, default: '' },
      checkIn: { type: String, default: '' },
      checkOut: { type: String, default: '' },
      guests: { type: Number, default: 1 },
      roomType: { type: String, default: '' },
      pricePerNight: { type: Number, default: 0 },
      note: { type: String, default: '' },
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'booking_drafts' }
);

module.exports = mongoose.model('BookingDraft', BookingDraftSchema);
