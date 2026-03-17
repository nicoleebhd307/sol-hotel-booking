const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    nationality: { type: String, trim: true },
    identityId: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
  },
  {
    collection: 'customers'
  }
);

module.exports = mongoose.model('Customer', CustomerSchema);
