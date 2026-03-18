const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    status: { type: String, required: true, enum: ['active', 'disabled'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
  },
  {
    collection: 'accounts'
  }
);

module.exports = mongoose.model('Account', AccountSchema);
