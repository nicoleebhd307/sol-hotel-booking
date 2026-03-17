const mongoose = require('mongoose');

const RoomTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    area: { type: Number, required: true, min: 0 },
    price_per_night: { type: Number, required: true, min: 0 },
    bed_options: { type: [String], default: [] },
    capacity: {
      adults: { type: Number, default: 1, min: 0 },
      children: { type: Number, default: 0, min: 0 }
    },
    description: { type: String, default: '' },
    amenities: { type: [String], default: [] },
    rate_includes: { type: [String], default: [] },
    service_charge: { type: Number, default: 5, min: 0 },
    vat: { type: Number, default: 10, min: 0 }
  },
  {
    collection: 'room_types'
  }
);

module.exports = mongoose.model('RoomType', RoomTypeSchema);
