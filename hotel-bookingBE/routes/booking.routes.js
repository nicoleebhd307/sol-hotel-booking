const express = require('express');
const router = express.Router();
const { BOOKINGS_MOCK } = require('../mockData/booking');

router.get('/', (req, res) => {
  res.json(BOOKINGS_MOCK);
});

router.get('/:id', (req, res) => {
  const booking = BOOKINGS_MOCK.find((item) => item._id === req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  return res.json(booking);
});

router.patch('/:id', (req, res) => {
  const booking = BOOKINGS_MOCK.find((item) => item._id === req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  const allowedFields = ['status', 'note', 'extraCharge', 'depositAmount', 'totalPrice'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      booking[field] = req.body[field];
    }
  });

  return res.json({
    success: true,
    data: booking,
  });
});

router.delete('/:id', (req, res) => {
  const bookingIndex = BOOKINGS_MOCK.findIndex((item) => item._id === req.params.id);

  if (bookingIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  const [removedBooking] = BOOKINGS_MOCK.splice(bookingIndex, 1);

  return res.json({
    success: true,
    data: removedBooking,
  });
});

module.exports = router;
