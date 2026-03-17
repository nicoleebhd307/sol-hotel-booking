const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

// Import mock data
const dashboardData = require('../mockData/dashboardData');
const checkInGuests = require('../mockData/checkins');
const checkOutGuests = require('../mockData/checkouts');

// Room availability data
const roomAvailability = [
  {
    roomType: 'Luxury Suites',
    available: 17,
    total: 20,
    percentage: 85
  },
  {
    roomType: 'Beachfront Villas',
    available: 8,
    total: 19,
    percentage: 42
  },
  {
    roomType: 'Ocean Deluxes',
    available: 20,
    total: 30,
    percentage: 67
  }
];

const managerSummary = {
  revenueToday: 15420,
  occupancyRate: 84,
  averageDailyRate: 285,
  pendingApprovals: 6,
  revenueStats: {
    percentage: 8,
    trend: 'up',
  },
  occupancyStats: {
    percentage: 4,
    trend: 'up',
  },
  averageRateStats: {
    percentage: 3,
    trend: 'up',
  },
  pendingStats: {
    percentage: 2,
    trend: 'down',
  },
};

router.use(requireAuth);

/**
 * GET /api/dashboard/summary
 * Returns dashboard summary statistics
 */
router.get('/summary', requireRole(['receptionist', 'manager']), (req, res) => {
  try {
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/dashboard/checkins
 * Returns list of check-in guests
 */
router.get('/checkins', requireRole(['receptionist', 'manager']), (req, res) => {
  try {
    res.json({
      success: true,
      data: checkInGuests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/dashboard/checkouts
 * Returns list of check-out guests
 */
router.get('/checkouts', requireRole(['receptionist', 'manager']), (req, res) => {
  try {
    res.json({
      success: true,
      data: checkOutGuests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/dashboard/room-availability
 * Returns room availability statistics
 */
router.get('/room-availability', requireRole(['receptionist', 'manager']), (req, res) => {
  try {
    res.json({
      success: true,
      data: roomAvailability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * GET /api/dashboard/manager-summary
 * Returns manager summary statistics
 */
router.get('/manager-summary', requireRole('manager'), (req, res) => {
  try {
    res.json({
      success: true,
      data: managerSummary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
