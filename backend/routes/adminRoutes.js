const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/login', adminController.login);

// --- Existing backend API routes (unchanged) ---
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

// --- Admin FE compatible endpoints ---
// PATCH /api/admin/bookings/:id — update booking fields
router.patch('/bookings/:id', authMiddleware, roleMiddleware(['receptionist', 'manager', 'admin']), adminController.updateBookingForAdminFE);
// PATCH /api/admin/bookings/:id/status — update booking status
router.patch('/bookings/:id/status', authMiddleware, roleMiddleware(['receptionist', 'manager', 'admin']), adminController.updateBookingStatusForAdminFE);
// PATCH /api/admin/bookings/:id/services — add extra services
router.patch('/bookings/:id/services', authMiddleware, roleMiddleware(['receptionist', 'manager', 'admin']), adminController.addExtraServicesForAdminFE);
// DELETE /api/admin/bookings/:id — cancel booking
router.delete('/bookings/:id', authMiddleware, roleMiddleware(['receptionist', 'manager', 'admin']), adminController.cancelBookingForAdminFE);

// Refund management
router.get('/refunds', authMiddleware, roleMiddleware(['manager', 'admin']), adminController.getRefundRequests);
router.patch('/refunds/:id/confirm', authMiddleware, roleMiddleware(['manager', 'admin']), adminController.confirmRefund);
router.patch('/refunds/:id/reject', authMiddleware, roleMiddleware(['manager', 'admin']), adminController.rejectRefund);
router.patch('/refunds/:id/complete', authMiddleware, roleMiddleware(['manager', 'admin']), adminController.completeRefund);

// Reports
router.get('/reports', authMiddleware, roleMiddleware(['manager', 'admin']), adminController.getReports);

module.exports = router;
