const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
  {
    username: { type: String, trim: true, unique: true, sparse: true, index: true },
    email:    { type: String, trim: true, lowercase: true, unique: true, sparse: true, index: true },
    passwordHash: { type: String },
    password:     { type: String },
    status: { type: String, required: true, enum: ['active', 'disabled'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
  },
  {
    collection: 'accounts'
  }
);

module.exports = mongoose.model('Account', AccountSchema);
