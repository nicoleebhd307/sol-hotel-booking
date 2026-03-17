const Customer = require('../models/Customer');

async function createCustomer(req, res, next) {
  try {
    const { name, email, phone, nationality, identityId } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ message: 'name and email are required' });
    }

    const customer = await Customer.create({
      name,
      email: String(email).trim().toLowerCase(),
      phone,
      nationality,
      identityId
    });

    return res.status(201).json(customer.toObject());
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createCustomer
};
