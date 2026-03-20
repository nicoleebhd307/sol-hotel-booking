const ADMIN_BOOKING_SCHEMA = {
  bookingId: 'string',
  customerName: 'string',
  phone: 'string',
  roomType: 'string',
  checkInDate: 'YYYY-MM-DD',
  checkOutDate: 'YYYY-MM-DD',
  status: 'pending | confirmed | cancelled',
  totalAmount: 'number',
  depositAmount: 'number',
  createdAt: 'YYYY-MM-DD',
  extraServices: [
    {
      name: 'string',
      amount: 'number',
      createdAt: 'ISO string',
    },
  ],
  cancellation: {
    requested: 'boolean',
    reason: 'string',
    requestedAt: 'ISO string',
    approvedAt: 'ISO string',
  },
  refund: {
    status: 'none | pending | confirmed | rejected',
    amount: 'number',
    processedAt: 'ISO string',
    note: 'string',
  },
};

module.exports = {
  ADMIN_BOOKING_SCHEMA,
};
