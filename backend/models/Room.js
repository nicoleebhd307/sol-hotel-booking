const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema(
  {
    room_number: { type: String, required: true, trim: true, unique: true, index: true },
    room_type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomType', required: true, index: true },
    floor: { type: Number, default: 1 },
    status: { type: String, required: true, enum: ['available', 'maintenance', 'occupied'], default: 'available' },
    beach_view: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true, index: true }
  },
  {
    collection: 'rooms'
  }
);

module.exports = mongoose.model('Room', RoomSchema);
