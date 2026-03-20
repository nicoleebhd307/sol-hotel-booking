const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { CUSTOMERS_MOCK } = require('../mockData/customers');

const router = express.Router();

router.use(requireAuth, requireRole(['manager', 'receptionist']));

function parseFilters(query = {}) {
  return {
    search: (query.search || '').toString().trim().toLowerCase(),
    nationality: (query.nationality || 'all').toString().trim(),
    dateFrom: (query.dateFrom || '').toString().trim(),
    dateTo: (query.dateTo || '').toString().trim(),
    sortBy: (query.sortBy || 'recentlyCreated').toString().trim(),
  };
}

function filterCustomers(filters) {
  const { search, nationality, dateFrom, dateTo } = filters;

  return CUSTOMERS_MOCK.filter((customer) => {
    if (search) {
      const haystack = `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }

    if (nationality && nationality.toLowerCase() !== 'all' && customer.nationality !== nationality) {
      return false;
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      const current = new Date(customer.createdAt).getTime();
      if (Number.isFinite(from) && current < from) {
        return false;
      }
    }

    if (dateTo) {
      const to = new Date(dateTo).getTime();
      const current = new Date(customer.createdAt).getTime();
      if (Number.isFinite(to) && current > to) {
        return false;
      }
    }

    return true;
  });
}

function toCsvValue(value) {
  const normalized = value === undefined || value === null ? '' : String(value);
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
}

function sortCustomers(customers, sortBy) {
  const sorted = [...customers];

  switch (sortBy) {
    case 'oldestCreated':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'nameAsc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'nameDesc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'recentlyCreated':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

router.get('/export', (req, res) => {
  const filters = parseFilters(req.query);
  const filtered = filterCustomers(filters);
  const sorted = sortCustomers(filtered, filters.sortBy);

  const headers = ['name', 'email', 'phone', 'nationality', 'identityId', 'createdAt'];
  const csvRows = [headers.join(',')];

  sorted.forEach((customer) => {
    csvRows.push([
      toCsvValue(customer.name),
      toCsvValue(customer.email),
      toCsvValue(customer.phone),
      toCsvValue(customer.nationality),
      toCsvValue(customer.identityId),
      toCsvValue(customer.createdAt),
    ].join(','));
  });

  const fileName = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  return res.status(200).send(csvRows.join('\n'));
});

router.get('/', (req, res) => {
  const filters = parseFilters(req.query);
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

  const filtered = filterCustomers(filters);
  const sorted = sortCustomers(filtered, filters.sortBy);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * limit;
  const end = start + limit;

  return res.json({
    success: true,
    data: sorted.slice(start, end),
    pagination: {
      page: safePage,
      limit,
      totalItems,
      totalPages,
    },
  });
});

router.get('/:id', (req, res) => {
  const customer = CUSTOMERS_MOCK.find((item) => item._id === req.params.id);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  return res.json({ success: true, data: customer });
});

module.exports = router;
