const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const dashboardService = require('../services/dashboardService');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(['receptionist', 'manager', 'admin']));

// GET /api/dashboard/summary
router.get('/summary', async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary();
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
});

// GET /api/dashboard/checkins
router.get('/checkins', async (req, res, next) => {
  try {
    const data = await dashboardService.getCheckIns();
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
});

// GET /api/dashboard/checkouts
router.get('/checkouts', async (req, res, next) => {
  try {
    const data = await dashboardService.getCheckOuts();
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
});

// GET /api/dashboard/room-availability
router.get('/room-availability', async (req, res, next) => {
  try {
    const data = await dashboardService.getRoomAvailability();
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
});

// GET /api/dashboard/manager-summary
router.get('/manager-summary', async (req, res, next) => {
  try {
    const data = await dashboardService.getManagerSummary();
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
