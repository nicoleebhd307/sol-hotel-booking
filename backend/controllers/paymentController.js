const paymentService = require('../services/paymentService');
const momoV2Gateway = require('../payment/momo/momoV2Gateway');

// ---------------------------------------------------------------------------
// POST /api/payment/momo/create
// ---------------------------------------------------------------------------
async function momoCreate(req, res) {
  try {
    const { bookingId, channel, paymentCode } = req.body || {};
    const result = await paymentService.initMomoSession({ bookingId, channel, paymentCode });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[MoMo Create Error]', err.message, {
      statusCode: err.statusCode,
      momoResultCode: err.momoResultCode
    });
    return res.status(err.statusCode || 502).json({
      message: err.message || 'MoMo payment initialization failed',
      momoResultCode: err.momoResultCode
    });
  }
}

// kept for backwards-compat with /api/payments/momo-v2/init
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

// ---------------------------------------------------------------------------
// POST /api/payment/momo/ipn  — IPN callback from MoMo servers
// ---------------------------------------------------------------------------
async function momoIpn(req, res, next) {
  try {
    const payload = req.body || {};

    // Reject spoofed callbacks — verify MoMo's HMAC-SHA256 signature first
    if (!momoV2Gateway.verifyCallbackSignature(payload)) {
      console.error('[MoMo IPN] Signature mismatch — request rejected', { orderId: payload.orderId });
      // MoMo requires HTTP 200 even on errors; use non-zero resultCode
      return res.status(200).json({ resultCode: 1, message: 'invalid_signature' });
    }

    const result = await paymentService.handleMomoCallback({ payload });

    if (result.status === 'success') {
      return res.status(200).json({ resultCode: 0, message: 'success' });
    }
    return res.status(200).json({ resultCode: 0, message: 'processed_failed_status' });
  } catch (err) {
    return next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/payment/momo/return  — browser redirect after MoMo payment
// ---------------------------------------------------------------------------
async function momoReturn(req, res, next) {
  try {
    const payload = req.query || {};

    let result = { bookingId: null, status: 'failed' };
    try {
      result = await paymentService.handleMomoCallback({ payload });
    } catch (cbErr) {
      console.error('[MoMo Return] Callback processing error:', cbErr.message);
    }

    // REDIRECT_URL → frontend payment-result page (e.g. http://localhost:4200/payment-result)
    // MOMO_REDIRECT_URL → this backend endpoint itself (what was sent to MoMo)
    const frontendResultUrl =
      process.env.REDIRECT_URL ||
      `${process.env.FRONTEND_BASE_URL || 'http://localhost:4200'}/payment-result`;

    const status = result.status === 'success' ? 'momo_success' : 'momo_failed';
    const bookingParam = result.bookingId ? `&bookingId=${result.bookingId}` : '';

    return res.redirect(`${frontendResultUrl}?payment=${status}${bookingParam}`);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  momoCreate,
  initMomoV2Session,
  payDeposit,
  momoReturn,
  momoIpn
};
