const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Existing stub payment
router.post('/deposit', paymentController.payDeposit);

// VNPay integration
router.post('/vnpay/create', paymentController.createVnpayPayment);
router.get('/vnpay/return', paymentController.vnpayReturn);
router.get('/vnpay/ipn', paymentController.vnpayIpn);
router.get('/vnpay/test', paymentController.vnpayTest);

module.exports = router;
