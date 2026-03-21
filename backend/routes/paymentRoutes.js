const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/momo-v2/init', paymentController.initMomoV2Session);
router.get('/momo/return', paymentController.momoReturn);
router.post('/momo/ipn', paymentController.momoIpn);
router.post('/deposit', paymentController.payDeposit);

module.exports = router;
