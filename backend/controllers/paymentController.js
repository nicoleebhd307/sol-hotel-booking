const paymentService = require('../services/paymentService');

async function initMomoV2Session(req, res, next) {
  try {
    const { bookingId, channel, paymentCode } = req.body || {};

    const result = await paymentService.initMomoSession({ bookingId, channel, paymentCode });

    return res.status(200).json(result);
  } catch (err) {
    console.error('[MoMo Init Error]', err.message, { statusCode: err.statusCode, momoResultCode: err.momoResultCode });
    return res.status(err.statusCode || 502).json({
      message: err.message || 'MoMo payment initialization failed',
      momoResultCode: err.momoResultCode
    });
  }
}

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

async function momoReturn(req, res, next) {
  try {
    const result = await paymentService.handleMomoCallback({ payload: req.query || {} });

    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:4202';

    if (!result.bookingId) {
      return res.redirect(`${frontendBaseUrl}/booking-create?payment=momo_failed`);
    }

    const status = result.status === 'success' ? 'momo_success' : 'momo_failed';
    return res.redirect(`${frontendBaseUrl}/booking/${result.bookingId}?payment=${status}`);
  } catch (err) {
    return next(err);
  }
}

async function momoIpn(req, res, next) {
  try {
    const result = await paymentService.handleMomoCallback({ payload: req.body || {} });

    if (result.status === 'success') {
      return res.status(200).json({ resultCode: 0, message: 'success' });
    }

    return res.status(200).json({ resultCode: 0, message: 'processed_failed_status' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  initMomoV2Session,
  payDeposit,
  momoReturn,
  momoIpn
};
