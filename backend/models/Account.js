const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['receptionist', 'manager', 'admin'],
      index: true
    },
    status: { type: String, required: true, enum: ['active', 'disabled'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
  },
  {
    collection: 'accounts'
  }
);

module.exports = mongoose.model('Account', AccountSchema);
