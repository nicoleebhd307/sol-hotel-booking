/**
 * Standalone VNPay Signing Test Script
 * Run: node test-vnpay-sign.js
 *
 * Tests the signing logic independently (no DB needed).
 * Compares our output with VNPay's expected PHP behavior.
 */
require('dotenv').config();
const crypto = require('crypto');

const TMN_CODE  = process.env.VNPAY_TMN_CODE  || 'LH5EO45P';
const SECRET_KEY = process.env.VNPAY_SECRET_KEY || 'RG5SDNNAQQCE72QAZX2PFPJANLZ1DAPN';
const VNPAY_URL  = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const RETURN_URL = process.env.VNPAY_RETURN_URL || 'https://sol-hotel-booking-1.onrender.com/api/payments/vnpay/return';

// ---------- helpers ----------
function sortObject(obj) {
  const sorted = {};
  Object.keys(obj).sort().forEach(key => {
    sorted[key] = obj[key];
  });
  return sorted;
}

function phpUrlencode(str) {
  // Match PHP's urlencode: encodeURIComponent + replace %20 with +
  return encodeURIComponent(String(str)).replace(/%20/g, '+');
}

function hmacSha512(key, data) {
  return crypto.createHmac('sha512', key).update(Buffer.from(data, 'utf-8')).digest('hex');
}

// ---------- build payment URL ----------
function buildPaymentUrl(params) {
  const sorted = sortObject(params);

  // Build sign data: key=urlencode(value)&key=urlencode(value)
  // Keys are ASCII so urlencode doesn't change them
  const signData = Object.entries(sorted)
    .map(([k, v]) => `${k}=${phpUrlencode(v)}`)
    .join('&');

  const secureHash = hmacSha512(SECRET_KEY, signData);

  // Final URL uses the same encoded query + hash
  const fullUrl = `${VNPAY_URL}?${signData}&vnp_SecureHash=${secureHash}`;

  return { sorted, signData, secureHash, fullUrl };
}

// ---------- run test ----------
const now = new Date();
const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
const createDate = vnTime.toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);
const expireDate = new Date(vnTime.getTime() + 15 * 60 * 1000)
  .toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);

const testParams = {
  vnp_Version: '2.1.0',
  vnp_Command: 'pay',
  vnp_TmnCode: TMN_CODE,
  vnp_Amount: '1000000',       // 10,000 VND * 100
  vnp_CreateDate: createDate,
  vnp_CurrCode: 'VND',
  vnp_IpAddr: '127.0.0.1',
  vnp_Locale: 'vn',
  vnp_OrderInfo: 'Thanh toan test don hang 12345',
  vnp_OrderType: 'other',
  vnp_ReturnUrl: RETURN_URL,
  vnp_TxnRef: 'TEST' + Date.now(),
  vnp_ExpireDate: expireDate,
};

console.log('=== VNPay Signing Test ===');
console.log('TMN_CODE:', TMN_CODE);
console.log('SECRET_KEY:', SECRET_KEY.slice(0, 6) + '...');
console.log('RETURN_URL:', RETURN_URL);
console.log('');

const result = buildPaymentUrl(testParams);

console.log('--- Sorted Params ---');
Object.entries(result.sorted).forEach(([k, v]) => console.log(`  ${k} = ${v}`));
console.log('');
console.log('--- Sign Data ---');
console.log(result.signData);
console.log('');
console.log('--- Secure Hash ---');
console.log(result.secureHash);
console.log('');
console.log('--- Full URL ---');
console.log(result.fullUrl);
console.log('');

// Verify: parse URL back, strip hash, re-sign
const url = new URL(result.fullUrl);
const receivedParams = {};
url.searchParams.forEach((value, key) => {
  receivedParams[key] = value;
});

const receivedHash = receivedParams.vnp_SecureHash;
delete receivedParams.vnp_SecureHash;
delete receivedParams.vnp_SecureHashType;

const sortedReceived = sortObject(receivedParams);
const reSignData = Object.entries(sortedReceived)
  .map(([k, v]) => `${k}=${phpUrlencode(v)}`)
  .join('&');
const reHash = hmacSha512(SECRET_KEY, reSignData);

console.log('--- Verify (re-sign from URL params) ---');
console.log('Re-sign data matches original:', reSignData === result.signData);
console.log('Hash matches:', reHash === receivedHash);
console.log('');

// Test with different encoding to compare
const signDataNoEncode = Object.entries(sortObject(testParams))
  .map(([k, v]) => `${k}=${v}`)
  .join('&');
const hashNoEncode = hmacSha512(SECRET_KEY, signDataNoEncode);

console.log('--- Comparison: encode vs no-encode ---');
console.log('With encode (correct):', result.secureHash.slice(0, 32) + '...');
console.log('Without encode (wrong):', hashNoEncode.slice(0, 32) + '...');
console.log('Same?', result.secureHash === hashNoEncode);
console.log('');
console.log('Copy the Full URL above and open in browser to test with VNPay sandbox.');
