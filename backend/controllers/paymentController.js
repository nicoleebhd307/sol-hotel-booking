const paymentService = require('../services/paymentService');
const vnpayService = require('../services/vnpayService');
const { buildPaymentUrl, sortObject, createSignature, formatVnpayDate } = require('../utils/vnpay');

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

/**
 * POST /api/payments/vnpay/create
 * Body: { bookingId }
 * Returns: { paymentUrl }
 */
async function createVnpayPayment(req, res, next) {
  try {
    const { bookingId } = req.body || {};

    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }

    // Extract client IP — normalize IPv6 loopback to IPv4
    let ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.connection?.remoteAddress ||
      '127.0.0.1';
    // ::1 or ::ffff:127.0.0.1 → 127.0.0.1
    if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
      ipAddress = '127.0.0.1';
    } else if (ipAddress.startsWith('::ffff:')) {
      ipAddress = ipAddress.replace('::ffff:', '');
    }

    const { paymentUrl } = await vnpayService.createVnpayPaymentUrl({
      bookingId,
      ipAddress,
    });

    return res.status(200).json({ paymentUrl });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/payments/vnpay/return
 * VNPay redirects user here after payment.
 * Verifies signature, updates booking/payment, redirects to frontend.
 */
async function vnpayReturn(req, res, next) {
  try {
    const result = await vnpayService.handleVnpayReturn(req.query);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

    if (result.success) {
      return res.redirect(
        `${frontendUrl}/payment-success?bookingId=${result.bookingId}`
      );
    }

    return res.redirect(
      `${frontendUrl}/payment-fail?bookingId=${result.bookingId || ''}&message=${encodeURIComponent(result.message)}`
    );
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/payments/vnpay/ipn
 * VNPay server-to-server callback (IPN).
 * Must respond with JSON { RspCode, Message }.
 */
async function vnpayIpn(req, res) {
  try {
    const result = await vnpayService.handleVnpayReturn(req.query);

    if (!result.isSignatureValid) {
      return res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
    }

    if (!result.paymentFound) {
      return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
    }

    if (result.alreadyProcessed) {
      return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
  } catch (err) {
    return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
  }
}

/**
 * GET /api/payments/vnpay/test
 * Debug endpoint: generates a test payment URL without DB.
 * Returns all signing details for verification.
 */
async function vnpayTest(req, res) {
  try {
    const tmnCode   = process.env.VNPAY_TMN_CODE;
    const secretKey = process.env.VNPAY_SECRET_KEY;
    const vnpUrl    = process.env.VNPAY_URL;
    const returnUrl = process.env.VNPAY_RETURN_URL;

    const amount = Number(req.query.amount) || 10000;

    const createDate = formatVnpayDate(new Date());
    const expireDate = formatVnpayDate(new Date(Date.now() + 15 * 60 * 1000));

    const rawParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: String(Math.round(amount * 100)),
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderInfo: 'Test thanh toan don hang ' + Date.now(),
      vnp_OrderType: 'other',
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: 'TEST' + Date.now(),
      vnp_ExpireDate: expireDate,
    };

    const sorted = sortObject(rawParams);
    const signData = Object.entries(sorted)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    const secureHash = createSignature(secretKey, signData);
    const paymentUrl = vnpUrl + '?' + signData + '&vnp_SecureHash=' + secureHash;

    return res.status(200).json({
      config: { tmnCode, returnUrl, vnpUrl },
      rawParams,
      sortedEncodedParams: sorted,
      signData,
      secureHash,
      paymentUrl,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  payDeposit,
  createVnpayPayment,
  vnpayReturn,
  vnpayIpn,
  vnpayTest,
};
