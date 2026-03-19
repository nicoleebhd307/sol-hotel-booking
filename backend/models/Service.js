const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    imageUrl: { type: String, required: true, trim: true }
  },
  {
    collection: 'services',
    timestamps: true
  }
);

module.exports = mongoose.model('Service', ServiceSchema);
