const REFUND_REQUESTS_MOCK = [
  {
    id: 'RR-174023375027',
    bookingId: 'AZ-1234',
    customerName: 'Elena Rodriguez',
    phone: '+34 600 123 456',
    depositAmount: 200,
    status: 'pending',
    createdAt: new Date().toISOString(),
    processedAt: '',
    note: '',
  },
];

module.exports = {
  REFUND_REQUESTS_MOCK,
};
