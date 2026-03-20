const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { AdminBookingService } = require('../services/admin-booking.service');
const { AdminBookingController } = require('../controllers/admin-booking.controller');

const router = express.Router();
const service = new AdminBookingService();
const controller = new AdminBookingController(service);

router.use(requireAuth, requireRole(['manager', 'receptionist']));

router.get('/reports', controller.getReports);
router.get('/bookings', controller.listBookings);
router.get('/bookings/:bookingId', controller.getBookingDetail);
router.patch('/bookings/:bookingId', controller.updateBooking);
router.patch('/bookings/:bookingId/status', controller.updateBookingStatus);
router.patch('/bookings/:bookingId/services', controller.addExtraServices);
router.delete('/bookings/:bookingId', controller.cancelBooking);

router.get('/refunds', controller.listRefundRequests);
router.patch('/refunds/:bookingId/confirm', controller.confirmRefund);
router.patch('/refunds/:bookingId/reject', controller.rejectRefund);

module.exports = router;
