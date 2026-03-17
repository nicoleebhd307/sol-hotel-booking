const express = require('express');
const adminController = require('../controllers/adminController');
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/login', adminController.login);
router.get('/dashboard', authMiddleware, roleMiddleware(['receptionist', 'manager', 'admin']), dashboardController.getReceptionistDashboard);

router.get('/bookings', authMiddleware, roleMiddleware(['receptionist', 'manager', 'admin']), adminController.listBookings);
router.get('/bookings/:id', authMiddleware, roleMiddleware(['receptionist', 'manager', 'admin']), adminController.getBookingDetails);
router.post('/bookings', authMiddleware, roleMiddleware(['manager', 'admin']), adminController.createManualBooking);
router.post('/bookings/:id/cancel', authMiddleware, roleMiddleware(['receptionist', 'manager', 'admin']), adminController.cancelBooking);
router.post('/bookings/:id/check-in', authMiddleware, roleMiddleware(['receptionist', 'manager', 'admin']), adminController.confirmCheckIn);
router.post('/bookings/:id/check-out', authMiddleware, roleMiddleware(['receptionist', 'manager', 'admin']), adminController.confirmCheckOut);
router.patch('/bookings/:id/extra-charges', authMiddleware, roleMiddleware(['receptionist', 'manager', 'admin']), adminController.addExtraCharges);
router.patch('/bookings/:id/note', authMiddleware, roleMiddleware(['receptionist', 'manager', 'admin']), adminController.addNote);

router.get('/rooms/calendar', authMiddleware, roleMiddleware(['receptionist', 'manager', 'admin']), adminController.getRoomCalendar);
router.get('/stats/bookings', authMiddleware, roleMiddleware(['manager', 'admin']), adminController.getBookingStats);

module.exports = router;
