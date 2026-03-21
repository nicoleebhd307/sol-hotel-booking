const crypto = require('crypto');
const qs = require('qs');

/**
 * Sort object keys alphabetically.
 * VNPay requires params to be sorted before signing.
 */
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  }
  return sorted;
}

/**
 * Create HMAC SHA512 signature from a query string.
 * @param {string} secretKey - VNPay secret key
 * @param {string} data      - The sorted query string to sign
 * @returns {string} hex-encoded HMAC SHA512 signature
 */
function createSignature(secretKey, data) {
  return crypto
    .createHmac('sha512', secretKey)
    .update(Buffer.from(data, 'utf-8'))
    .digest('hex');
}

/**
 * Build the full VNPay payment URL.
 * Matches VNPay's official PHP demo: both signData and query use urlencode.
 */
function buildPaymentUrl({ orderId, amount, orderInfo, ipAddress, bankCode, locale }) {
  const tmnCode   = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_SECRET_KEY;
  const vnpUrl    = process.env.VNPAY_URL;
  const returnUrl = process.env.VNPAY_RETURN_URL;

  if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
    throw new Error('Missing VNPay configuration in environment variables');
  }

  const createDate = formatVnpayDate(new Date());
  // Expire in 15 minutes
  const expireDate = formatVnpayDate(new Date(Date.now() + 15 * 60 * 1000));

  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Amount: String(Math.round(amount * 100)),
    vnp_CreateDate: createDate,
    vnp_CurrCode: 'VND',
    vnp_IpAddr: ipAddress,
    vnp_Locale: locale || 'vn',
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: orderId,
    vnp_ExpireDate: expireDate,
  };

  if (bankCode) {
    vnp_Params.vnp_BankCode = bankCode;
  }

  // Sort alphabetically and urlencode values (matching PHP urlencode)
  const sorted = sortObject(vnp_Params);

  // Build signData: key=encodedValue&key=encodedValue (keys already sorted, values already encoded)
  const signData = Object.entries(sorted)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const secureHash = createSignature(secretKey, signData);

  // Build final URL: same query string + hash
  return vnpUrl + '?' + signData + '&vnp_SecureHash=' + secureHash;
}

/**
 * Verify the VNPay return/IPN query params.
 * VNPay sends params URL-encoded; Express auto-decodes them.
 * We re-encode to match the original signing, then verify hash.
 */
function verifyReturnUrl(query) {
  const secretKey = process.env.VNPAY_SECRET_KEY;
  if (!secretKey) throw new Error('Missing VNPAY_SECRET_KEY');

  const params = { ...query };
  const receivedHash = params.vnp_SecureHash;

  // Remove hash fields before re-signing
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  // Sort and encode (same as building)
  const sorted = sortObject(params);
  const signData = Object.entries(sorted)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const expectedHash = createSignature(secretKey, signData);

  // Constant-time comparison to prevent timing attacks
  const isValid =
    receivedHash &&
    expectedHash.length === receivedHash.length &&
    crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), Buffer.from(receivedHash, 'hex'));

  return {
    isValid,
    responseCode: params.vnp_ResponseCode,
    txnRef: params.vnp_TxnRef,
    amount: params.vnp_Amount ? Number(params.vnp_Amount) / 100 : 0,
    transactionNo: params.vnp_TransactionNo || '',
  };
}

/**
 * Format a Date to VNPay's yyyyMMddHHmmss format (UTC+7).
 */
function formatVnpayDate(date) {
  const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const y = vnTime.getUTCFullYear();
  const m = String(vnTime.getUTCMonth() + 1).padStart(2, '0');
  const d = String(vnTime.getUTCDate()).padStart(2, '0');
  const h = String(vnTime.getUTCHours()).padStart(2, '0');
  const min = String(vnTime.getUTCMinutes()).padStart(2, '0');
  const s = String(vnTime.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}${h}${min}${s}`;
}

module.exports = {
  sortObject,
  createSignature,
  buildPaymentUrl,
  verifyReturnUrl,
  formatVnpayDate,
};
