const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.post('/', bookingController.createBooking);
router.get('/:id', bookingController.getBooking);
router.post('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
