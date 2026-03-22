const express = require('express');
const Customer = require('../models/Customer');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/customers/lookup?phone=xxx (existing)
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

// GET /api/customers/export — CSV export
router.get('/export', authMiddleware, async (req, res, next) => {
  try {
    const { search, sortBy } = req.query;
    const query = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'oldestCreated') sort = { createdAt: 1 };
    else if (sortBy === 'nameAsc') sort = { name: 1 };
    else if (sortBy === 'nameDesc') sort = { name: -1 };

    const customers = await Customer.find(query).sort(sort).lean();

    const header = 'Name,Email,Phone,Identity ID,Created At\n';
    const rows = customers.map(c => {
      const escapeCsvField = (val) => {
        const str = String(val || '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      return [
        escapeCsvField(c.name),
        escapeCsvField(c.email),
        escapeCsvField(c.phone),
        escapeCsvField(c.identityId),
        escapeCsvField(c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : ''),
      ].join(',');
    });

    const csv = header + rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
    return res.send(csv);
  } catch (err) {
    return next(err);
  }
});

// GET /api/customers — paginated list with search/sort/filter
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { search, sortBy } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    const query = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }


    let sort = { createdAt: -1 };
    if (sortBy === 'oldestCreated') sort = { createdAt: 1 };
    else if (sortBy === 'nameAsc') sort = { name: 1 };
    else if (sortBy === 'nameDesc') sort = { name: -1 };

    const [totalItems, customers] = await Promise.all([
      Customer.countDocuments(query),
      Customer.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return res.json({
      success: true,
      data: customers,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
