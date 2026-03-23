const crypto = require('crypto');
const https = require('https');

function postJson({ hostname, path, payload }) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);

    const req = https.request(
      {
        hostname,
        port: 443,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve({ statusCode: res.statusCode || 500, data: parsed });
          } catch (err) {
            reject(err);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function buildSessionBase({ booking, channel, paymentCode }) {
  const partnerCode = process.env.MOMO_PARTNER_CODE || '';
  const accessKey = process.env.MOMO_ACCESS_KEY || '';
  const secretKey = process.env.MOMO_SECRET_KEY || '';
  const normalizedChannel = channel === 'card' ? 'card' : 'qr';
  const requestType = normalizedChannel === 'card'
    ? (process.env.MOMO_REQUEST_TYPE_CARD || 'payWithMethod')
    : (process.env.MOMO_REQUEST_TYPE_QR || process.env.MOMO_REQUEST_TYPE || 'captureWallet');
  const backendBaseUrl = process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  const redirectUrl = process.env.MOMO_REDIRECT_URL || `${backendBaseUrl}/api/payments/momo/return`;
  const ipnUrl = process.env.MOMO_IPN_URL || `${backendBaseUrl}/api/payments/momo/ipn`;
  const momoPaymentCode = String(paymentCode || process.env.MOMO_TEST_PAYMENT_CODE || '').trim();

  const requestId = `MOMO_${Date.now()}`;
  const orderId = `BK_${booking._id}_${Date.now()}`;
  const exchangeRate = Number(process.env.MOMO_VND_EXCHANGE_RATE || 1);
  const depositBase = Number(booking.depositAmount || 0);
  const convertedVnd = Math.round(depositBase * (Number.isFinite(exchangeRate) && exchangeRate > 0 ? exchangeRate : 1));
  const amount = String(Math.min(50000000, Math.max(1000, convertedVnd)));
  const orderInfo = `Deposit for booking ${booking._id}`;
  const extraData = '';

  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;

  return {
    channel: normalizedChannel,
    partnerCode,
    accessKey,
    secretKey,
    requestType,
    redirectUrl,
    ipnUrl,
    requestId,
    orderId,
    amount,
    orderInfo,
    paymentCode: momoPaymentCode,
    extraData,
    rawSignature
  };
}

async function createTestSession({ booking, channel, paymentCode }) {
  const base = buildSessionBase({ booking, channel, paymentCode });
  const gatewayMode = process.env.PAYMENT_GATEWAY_MODE || 'stub';

  if (gatewayMode === 'stub' || !base.partnerCode || !base.accessKey || !base.secretKey) {
    const stubReason = gatewayMode === 'stub'
      ? 'PAYMENT_GATEWAY_MODE is set to stub. Running in simulated test mode.'
      : 'MoMo credentials are not configured. Running in simulated test mode.';
    return {
      mode: 'sandbox_stub',
      message: stubReason,
      orderId: base.orderId,
      requestId: base.requestId,
      amount: base.amount,
      orderInfo: base.orderInfo,
      requestType: base.requestType,
      channel: base.channel,
      paymentCode: base.paymentCode,
      redirectUrl: base.redirectUrl,
      ipnUrl: base.ipnUrl,
      rawSignaturePreview: base.rawSignature,
      payUrl: '',
      deeplink: '',
      qrCodeUrl: ''
    };
  }

  const signature = crypto.createHmac('sha256', base.secretKey).update(base.rawSignature).digest('hex');

  const payload = {
    partnerCode: base.partnerCode,
    accessKey: base.accessKey,
    requestId: base.requestId,
    amount: base.amount,
    orderId: base.orderId,
    orderInfo: base.orderInfo,
    redirectUrl: base.redirectUrl,
    ipnUrl: base.ipnUrl,
    extraData: base.extraData,
    requestType: base.requestType,
    signature,
    lang: 'vi'
  };

  if (base.paymentCode) {
    payload.paymentCode = base.paymentCode;
  }

  console.log('[MoMo] Sending to sandbox:', { amount: base.amount, orderId: base.orderId, requestType: base.requestType, channel: base.channel });

  const response = await postJson({
    hostname: 'test-payment.momo.vn',
    path: '/v2/gateway/api/create',
    payload
  });

  const body = response.data || {};
  if ((response.statusCode < 200 || response.statusCode >= 300) || Number(body.resultCode) !== 0) {
    console.error('[MoMo] Sandbox API error:', { statusCode: response.statusCode, resultCode: body.resultCode, message: body.message, localMessage: body.localMessage });
    const err = new Error(body.message || body.localMessage || 'Failed to initialize MoMo sandbox session');
    err.statusCode = 502;
    err.momoResultCode = body.resultCode;
    throw err;
  }

  return {
    mode: 'sandbox',
    message: body.message || 'MoMo session initialized',
    orderId: base.orderId,
    requestId: base.requestId,
    amount: base.amount,
    orderInfo: base.orderInfo,
    requestType: base.requestType,
    channel: base.channel,
    paymentCode: base.paymentCode,
    redirectUrl: base.redirectUrl,
    ipnUrl: base.ipnUrl,
    rawSignaturePreview: base.rawSignature,
    payUrl: body.payUrl || '',
    deeplink: body.deeplink || '',
    qrCodeUrl: body.qrCodeUrl || ''
  };
}

/**
 * Verify the HMAC-SHA256 signature on a MoMo IPN / redirect callback.
 *
 * MoMo v2 callback fields (alphabetical key=value):
 *   accessKey, amount, extraData, message, orderId, orderInfo,
 *   orderType, partnerCode, payType, requestId, responseTime,
 *   resultCode, transId
 *
 * Returns true in stub mode (so local dev doesn't need fake signatures).
 */
function verifyCallbackSignature(payload) {
  const gatewayMode = process.env.PAYMENT_GATEWAY_MODE || 'stub';
  if (gatewayMode === 'stub') return true;

  const accessKey = process.env.MOMO_ACCESS_KEY || '';
  const secretKey = process.env.MOMO_SECRET_KEY || '';

  const {
    amount       = '',
    extraData    = '',
    message      = '',
    orderId      = '',
    orderInfo    = '',
    orderType    = '',
    partnerCode  = '',
    payType      = '',
    requestId    = '',
    responseTime = '',
    resultCode   = '',
    transId      = '',
    signature
  } = payload;

  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&message=${message}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&orderType=${orderType}` +
    `&partnerCode=${partnerCode}` +
    `&payType=${payType}` +
    `&requestId=${requestId}` +
    `&responseTime=${responseTime}` +
    `&resultCode=${resultCode}` +
    `&transId=${transId}`;

  const expected = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(String(signature || ''), 'hex')
    );
  } catch {
    return false;
  }
}

module.exports = {
  createTestSession,
  verifyCallbackSignature
};
