const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { ROOMS_MOCK, ROOM_TYPES_MOCK } = require('../mockData/rooms');

router.use(requireAuth, requireRole(['receptionist', 'manager']));

router.get('/', (req, res) => {
  return res.json({
    success: true,
    data: ROOMS_MOCK,
  });
});

router.get('/types', (req, res) => {
  return res.json({
    success: true,
    data: ROOM_TYPES_MOCK,
  });
});

module.exports = router;
