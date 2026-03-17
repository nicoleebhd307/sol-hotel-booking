const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/deposit', paymentController.payDeposit);

module.exports = router;
