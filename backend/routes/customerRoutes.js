const express = require('express');
const Customer = require('../models/Customer');

const router = express.Router();

// GET /api/customers/lookup?phone=xxx
router.get('/lookup', async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ message: 'phone is required' });
    }
    const customer = await Customer.findOne({ phone: String(phone).trim() }).lean();
    return res.json(customer || null);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
