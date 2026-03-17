const paymentService = require('../services/paymentService');

async function payDeposit(req, res, next) {
  try {
    const { bookingId, paymentMethod, simulateStatus } = req.body || {};

    const result = await paymentService.payDeposit({
      bookingId,
      paymentMethod,
      simulateStatus
    });

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  payDeposit
};
