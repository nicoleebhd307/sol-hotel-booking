function toNumber(value, fallback = 0) {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function calculateDeposit(totalPrice, depositPercent) {
  const percent = Math.max(0, Math.min(100, toNumber(depositPercent, 0)));
  return Math.round((toNumber(totalPrice, 0) * percent) / 100);
}

function calculateRoomTotal({ nights, pricePerNight }) {
  return Math.round(toNumber(nights, 0) * toNumber(pricePerNight, 0));
}

function calculateTaxesAndFees({ baseAmount, serviceCharge = 0, vat = 0 }) {
  const base = toNumber(baseAmount, 0);
  const sc = toNumber(serviceCharge, 0);
  const v = toNumber(vat, 0);
  return {
    serviceChargeAmount: Math.round((base * sc) / 100),
    vatAmount: Math.round((base * v) / 100)
  };
}

module.exports = {
  calculateDeposit,
  calculateRoomTotal,
  calculateTaxesAndFees
};
