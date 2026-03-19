const express = require('express');
const router = express.Router();
const { BOOKINGS_MOCK, BOOKING_DRAFTS_MOCK } = require('../mockData/booking');

function nextNumericId(prefix, valueSelector = (item) => item._id) {
  const values = BOOKINGS_MOCK
    .map((item) => valueSelector(item))
    .filter((id) => typeof id === 'string' && id.startsWith(prefix))
    .map((id) => Number(id.replace(prefix, '')))
    .filter((value) => Number.isFinite(value));

  const max = values.length > 0 ? Math.max(...values) : 0;
  return max + 1;
}

function nextDraftId() {
  const values = BOOKING_DRAFTS_MOCK
    .map((item) => item._id)
    .filter((id) => typeof id === 'string' && id.startsWith('DR-'))
    .map((id) => Number(id.replace('DR-', '')))
    .filter((value) => Number.isFinite(value));

  const max = values.length > 0 ? Math.max(...values) : 0;
  return `DR-${String(max + 1).padStart(4, '0')}`;
}

function normalizeStatus(status) {
  if (status === 'completed') {
    return 'checked_out';
  }
  return status;
}

const VALID_STATUSES = new Set(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']);

const STATUS_TRANSITIONS = {
  pending: new Set(['confirmed', 'cancelled']),
  confirmed: new Set(['checked_in', 'cancelled']),
  checked_in: new Set(['checked_out']),
  checked_out: new Set([]),
  cancelled: new Set([]),
};

router.get('/', (req, res) => {
  res.json(BOOKINGS_MOCK);
});

router.get('/drafts/latest', (req, res) => {
  const latestDraft = BOOKING_DRAFTS_MOCK
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] || null;

  return res.json({
    success: true,
    data: latestDraft,
  });
});

router.post('/drafts', (req, res) => {
  const { draftId, selectedRoomId, formValue } = req.body;

  const normalizedDraft = {
    _id: typeof draftId === 'string' && draftId ? draftId : nextDraftId(),
    selectedRoomId: selectedRoomId || '',
    formValue: {
      phone: formValue?.phone || '',
      fullName: formValue?.fullName || '',
      email: formValue?.email || '',
      identityNumber: formValue?.identityNumber || '',
      checkIn: formValue?.checkIn || '',
      checkOut: formValue?.checkOut || '',
      guests: Number(formValue?.guests) > 0 ? Number(formValue.guests) : 1,
      roomType: formValue?.roomType || '',
      pricePerNight: Number(formValue?.pricePerNight) || 0,
      note: formValue?.note || '',
    },
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = BOOKING_DRAFTS_MOCK.findIndex((item) => item._id === normalizedDraft._id);

  if (existingIndex >= 0) {
    BOOKING_DRAFTS_MOCK[existingIndex] = normalizedDraft;
  } else {
    BOOKING_DRAFTS_MOCK.unshift(normalizedDraft);
  }

  return res.status(201).json({
    success: true,
    data: normalizedDraft,
  });
});

router.delete('/drafts/:id', (req, res) => {
  const draftIndex = BOOKING_DRAFTS_MOCK.findIndex((item) => item._id === req.params.id);

  if (draftIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Draft not found',
    });
  }

  BOOKING_DRAFTS_MOCK.splice(draftIndex, 1);

  return res.json({
    success: true,
  });
});

router.get('/:id', (req, res) => {
  const booking = BOOKINGS_MOCK.find((item) => item._id === req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  return res.json(booking);
});

router.post('/', (req, res) => {
  const {
    guestName,
    phone,
    email,
    identityNumber,
    checkIn,
    checkOut,
    guests,
    roomType,
    totalPrice,
    pricePerNight,
    status,
    note,
  } = req.body;

  const roomPrefixMap = {
    'Ocean Overwater Villa': 'R',
    'The Sunset Suite': 'V',
    'Deluxe Palm Room': 'PH',
    'Ocean Suite': 'R',
    'Garden Villa': 'V',
    'Lagoon Penthouse': 'PH',
    'Deluxe Room': 'R',
  };

  const roomPrefix = roomPrefixMap[roomType] || 'R';
  const roomIndex = String((BOOKINGS_MOCK.length % 50) + 100).padStart(3, '0');
  const roomId = `${roomPrefix}-${roomIndex}`;

  const nextBookingId = String(nextNumericId('AZ-', (item) => item._id)).padStart(4, '0');
  const nextCustomerId = String(nextNumericId('CUST-', (item) => item.customer_id)).padStart(4, '0');

  const parsedCheckIn = new Date(checkIn);
  const parsedCheckOut = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((parsedCheckOut.getTime() - parsedCheckIn.getTime()) / 86400000));
  const pricePerNightValue = Number(pricePerNight) > 0
    ? Number(pricePerNight)
    : Math.max(0, Math.round((Number(totalPrice) || 0) / nights));

  const newBooking = {
    _id: `AZ-${nextBookingId}`,
    customer_id: `CUST-${nextCustomerId}`,
    guest_name: guestName || 'Unknown Guest',
    guest_phone: phone || '-',
    guest_email: email || '',
    identity_number: identityNumber || '',
    room_type: roomType || 'Deluxe Room',
    room_number: `Room ${roomIndex}`,
    rooms: [{
      room_id: roomId,
      price_per_night: pricePerNightValue,
    }],
    check_in: checkIn,
    check_out: checkOut,
    guests: Number(guests) > 0 ? Number(guests) : 1,
    totalPrice: Number(totalPrice) || 0,
    depositAmount: 0,
    extraCharge: 0,
    status: status || 'confirmed',
    note: note || '',
    createdAt: new Date().toISOString().slice(0, 10),
  };

  BOOKINGS_MOCK.unshift(newBooking);

  return res.status(201).json({
    success: true,
    data: newBooking,
  });
});

router.patch('/:id', (req, res) => {
  const booking = BOOKINGS_MOCK.find((item) => item._id === req.params.id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  const allowedFields = ['status', 'note', 'extraCharge', 'depositAmount', 'totalPrice'];

  if (req.body.status !== undefined) {
    const currentStatus = normalizeStatus(booking.status);
    const nextStatus = normalizeStatus(req.body.status);

    if (!VALID_STATUSES.has(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking status',
      });
    }

    if (currentStatus !== nextStatus && !STATUS_TRANSITIONS[currentStatus]?.has(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: ${currentStatus} -> ${nextStatus}`,
      });
    }

    req.body.status = nextStatus;
    booking.status = currentStatus;
  }

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      booking[field] = req.body[field];
    }
  });

  return res.json({
    success: true,
    data: booking,
  });
});

router.delete('/:id', (req, res) => {
  const bookingIndex = BOOKINGS_MOCK.findIndex((item) => item._id === req.params.id);

  if (bookingIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  const [removedBooking] = BOOKINGS_MOCK.splice(bookingIndex, 1);

  return res.json({
    success: true,
    data: removedBooking,
  });
});

module.exports = router;
