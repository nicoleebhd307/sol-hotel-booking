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
  const exchangeRate = Number(process.env.MOMO_VND_EXCHANGE_RATE || 25000);
  const depositBase = Number(booking.depositAmount || 0);
  const convertedVnd = Math.round(depositBase * (Number.isFinite(exchangeRate) ? exchangeRate : 25000));
  const amount = String(Math.max(1000, convertedVnd));
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

  if (!base.partnerCode || !base.accessKey || !base.secretKey) {
    return {
      mode: 'sandbox_stub',
      message: 'MoMo test credentials are not configured. Running in simulated test mode.',
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

  const response = await postJson({
    hostname: 'test-payment.momo.vn',
    path: '/v2/gateway/api/create',
    payload
  });

  const body = response.data || {};
  if ((response.statusCode < 200 || response.statusCode >= 300) || Number(body.resultCode) !== 0) {
    const err = new Error(body.message || 'Failed to initialize MoMo sandbox session');
    err.statusCode = 502;
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

module.exports = {
  createTestSession
};
