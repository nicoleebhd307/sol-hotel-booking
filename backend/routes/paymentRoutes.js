const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/momo/create', paymentController.momoCreate);      // primary create endpoint
router.post('/momo-v2/init', paymentController.initMomoV2Session); // backwards-compat
router.get('/momo/return', paymentController.momoReturn);
router.post('/momo/ipn', paymentController.momoIpn);
router.post('/deposit', paymentController.payDeposit);

module.exports = router;
