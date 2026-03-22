const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema(
  {
    account_id: { type: String, required: true, index: true },
    role: {
      type: String,
      required: true,
      enum: ['receptionist', 'manager', 'admin'],
      index: true
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true }
  },
  {
    collection: 'staffs'
  }
);

module.exports = mongoose.model('Staff', StaffSchema);
