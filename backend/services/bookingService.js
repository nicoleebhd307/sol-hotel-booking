const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const availabilityService = require('./availabilityService');
const { diffNights, toDate } = require('../utils/dateUtils');
const { calculateDeposit, calculateRoomTotal, calculateTaxesAndFees } = require('../utils/priceCalculator');

function getEnvNumber(key, fallback) {
  const raw = process.env[key];
  const parsed = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getHoldExpiresAt(now) {
  const minutes = getEnvNumber('BOOKING_HOLD_MINUTES', 30);
  return new Date(now.getTime() + minutes * 60 * 1000);
}

async function expireStalePendingBookings() {
  const now = new Date();
  const result = await Booking.updateMany(
    { status: 'pending', holdExpiresAt: { $lte: now } },
    { $set: { status: 'cancelled', cancelledAt: now, note: 'Auto-cancelled: payment hold expired' } }
  );
  return result.modifiedCount || result.nModified || 0;
}

async function createOrReuseCustomer(customerInput) {
  if (!customerInput?.email) {
    const err = new Error('Customer email is required');
    err.statusCode = 400;
    throw err;
  }

  const email = String(customerInput.email).trim().toLowerCase();

  const existing = await Customer.findOne({ email }).lean();
  if (existing) return existing;

  const created = await Customer.create({
    name: customerInput.name,
    email,
    phone: customerInput.phone,
    identityId: customerInput.identityId
  });

  return created.toObject();
}

async function assertRoomsAvailable({ roomIds, checkIn, checkOut }) {
  const bookedIds = await availabilityService.findBookedRoomIds({ checkIn, checkOut });
  const bookedSet = new Set(bookedIds);

  for (const roomId of roomIds) {
    if (bookedSet.has(String(roomId))) {
      const err = new Error('One or more selected rooms are not available for the chosen dates');
      err.statusCode = 409;
      throw err;
    }
  }
}

async function calculateBookingPricing({ roomDocs, checkIn, checkOut, guests }) {
  const nights = diffNights(checkIn, checkOut);

  const chargeableAdults = Math.max(1, Number(guests?.adults || 1));
  const requestedChildren = Math.max(0, Number(guests?.children || 0));
  const totalIncludedAdults = roomDocs.reduce(
    (sum, room) => sum + Math.max(1, Number(room?.room_type_id?.capacity?.adults || 1)),
    0
  );
  const totalIncludedChildren = roomDocs.reduce(
    (sum, room) => sum + Math.max(0, Number(room?.room_type_id?.capacity?.children || 0)),
    0
  );
  const maxAllowedAdults = totalIncludedAdults * 2;
  const maxAllowedChildren = totalIncludedChildren * 2;

  if (chargeableAdults > maxAllowedAdults) {
    const err = new Error(`Adults exceeds policy limit. Maximum allowed is ${maxAllowedAdults}`);
    err.statusCode = 400;
    throw err;
  }

  if (requestedChildren > maxAllowedChildren) {
    const err = new Error(`Children exceeds policy limit. Maximum allowed is ${maxAllowedChildren}`);
    err.statusCode = 400;
    throw err;
  }

  let remainingExtraAdults = Math.max(0, chargeableAdults - totalIncludedAdults);
  let total = 0;
  let extraChargeTotal = 0;
  const roomSnapshots = [];

  for (const room of roomDocs) {
    const roomType = room.room_type_id;
    if (!roomType || !Number.isFinite(Number(roomType.price_per_night))) {
      const err = new Error('Room configuration is invalid. Please contact support.');
      err.statusCode = 400;
      throw err;
    }
    const pricePerNight = roomType.price_per_night;
    const includedAdults = Number(roomType?.capacity?.adults || 1);
    const extraAdults = Math.min(remainingExtraAdults, includedAdults);
    remainingExtraAdults -= extraAdults;

    const base = calculateRoomTotal({ nights, pricePerNight });
    const uncappedExtraGuestCharge = Math.round(extraAdults * pricePerNight * 0.5 * nights);
    const maxExtraGuestCharge = Math.round(base * 0.7);
    const extraGuestCharge = Math.min(uncappedExtraGuestCharge, maxExtraGuestCharge);
    const taxes = calculateTaxesAndFees({
      baseAmount: base + extraGuestCharge,
      serviceCharge: roomType.service_charge,
      vat: roomType.vat
    });

    total += base + extraGuestCharge + taxes.serviceChargeAmount + taxes.vatAmount;
    extraChargeTotal += extraGuestCharge;

    roomSnapshots.push({
      room_id: room._id,
      price_per_night: pricePerNight
    });
  }

  const depositPercent = getEnvNumber('DEPOSIT_PERCENT', 20);
  const depositAmount = calculateDeposit(total, depositPercent);

  return {
    nights,
    totalPrice: total,
    extraCharge: extraChargeTotal,
    depositAmount,
    roomSnapshots
  };
}

async function createBooking({ customer, roomIds, checkIn, checkOut, guests, note }) {
  if (!Array.isArray(roomIds) || roomIds.length === 0) {
    const err = new Error('roomIds is required');
    err.statusCode = 400;
    throw err;
  }

  const normalizedRoomIds = roomIds
    .map((id) => String(id || '').trim())
    .filter(Boolean);

  if (normalizedRoomIds.length === 0 || normalizedRoomIds.length !== roomIds.length) {
    const err = new Error('roomIds contains invalid values');
    err.statusCode = 400;
    throw err;
  }

  if (normalizedRoomIds.some((id) => !mongoose.isValidObjectId(id))) {
    const err = new Error('roomIds must be valid ids');
    err.statusCode = 400;
    throw err;
  }

  let inDate;
  let outDate;
  try {
    inDate = toDate(checkIn, 'check_in');
    outDate = toDate(checkOut, 'check_out');
    diffNights(inDate, outDate);
  } catch (error) {
    const err = new Error(error.message || 'Invalid check-in/check-out dates');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  const holdExpiresAt = getHoldExpiresAt(now);

  const customerDoc = await createOrReuseCustomer(customer);

  const rooms = await Room.find({
    _id: { $in: normalizedRoomIds },
    is_active: true,
    status: 'available'
  }).populate('room_type_id');

  if (rooms.length !== normalizedRoomIds.length) {
    const err = new Error('One or more rooms are invalid or not available');
    err.statusCode = 400;
    throw err;
  }

  await assertRoomsAvailable({ roomIds: normalizedRoomIds, checkIn: inDate, checkOut: outDate });

  const pricing = await calculateBookingPricing({ roomDocs: rooms, checkIn: inDate, checkOut: outDate, guests });

  const booking = await Booking.create({
    customer_id: customerDoc._id,
    rooms: pricing.roomSnapshots,
    check_in: inDate,
    check_out: outDate,
    guests: {
      adults: guests?.adults ?? 1,
      children: guests?.children ?? 0
    },
    totalPrice: pricing.totalPrice,
    depositAmount: pricing.depositAmount,
    extraCharge: pricing.extraCharge,
    status: 'pending',
    note: note || '',
    holdExpiresAt,
    refund_status: 'none'
  });

  return Booking.findById(booking._id)
    .populate('customer_id')
    .populate({ path: 'rooms.room_id', populate: { path: 'room_type_id' } })
    .lean();
}

function buildIdConditions(id) {
  const conditions = [{ _id: id }];
  if (mongoose.isValidObjectId(id)) {
    conditions.push({ _id: new mongoose.Types.ObjectId(id) });
  }
  return { $or: conditions };
}

async function searchBookings(query) {
  const trimmed = (query || '').trim();
  if (!trimmed) {
    const err = new Error('Search query is required');
    err.statusCode = 400;
    throw err;
  }

  const booking = await Booking.findOne(buildIdConditions(trimmed))
    .populate('customer_id')
    .populate({ path: 'rooms.room_id', populate: { path: 'room_type_id' } })
    .lean();

  return booking ? [booking] : [];
}

async function getBookingById(bookingId) {
  if (!bookingId || !String(bookingId).trim()) {
    const err = new Error('Invalid booking id');
    err.statusCode = 400;
    throw err;
  }

  const booking = await Booking.findOne(buildIdConditions(String(bookingId).trim()))
    .populate('customer_id')
    .populate({ path: 'rooms.room_id', populate: { path: 'room_type_id' } })
    .lean();

  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  const payment = await Payment.findOne({ bookingId: booking._id }).sort({ createdAt: -1 }).lean();

  return { booking, payment };
}

async function assertGuestCanAccess({ booking, customerEmail }) {
  if (!customerEmail) return;
  const email = String(customerEmail).trim().toLowerCase();
  const bookingEmail = String(booking.customer_id?.email || '').trim().toLowerCase();
  if (!bookingEmail || bookingEmail !== email) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
}

async function cancelPendingWithoutRefund(bookingId) {
  const now = new Date();
  const updated = await Booking.findOneAndUpdate(
    { _id: bookingId, status: 'pending' },
    { $set: { status: 'cancelled', cancelledAt: now } },
    { new: true }
  );

  if (!updated) {
    const err = new Error('Booking cannot be cancelled');
    err.statusCode = 409;
    throw err;
  }

  return updated.toObject();
}

async function adminUpdateBookingStatus(bookingId, newStatus) {
  const allowed = new Set(['confirmed', 'cancelled', 'checked_in', 'checked_out', 'completed', 'pending']);
  if (!allowed.has(newStatus)) {
    const err = new Error('Invalid status');
    err.statusCode = 400;
    throw err;
  }

  const booking = await Booking.findOneAndUpdate(
    buildIdConditions(bookingId),
    { $set: { status: newStatus } },
    { new: true }
  );

  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  return booking.toObject();
}

async function adminAddExtraCharges(bookingId, extraCharge) {
  const val = Number(extraCharge);
  if (!Number.isFinite(val) || val < 0) {
    const err = new Error('extraCharge must be a non-negative number');
    err.statusCode = 400;
    throw err;
  }

  const booking = await Booking.findOneAndUpdate(
    buildIdConditions(bookingId),
    { $set: { extraCharge: val } },
    { new: true }
  );

  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  return booking.toObject();
}

async function adminAddNote(bookingId, note) {
  const booking = await Booking.findOneAndUpdate(
    buildIdConditions(bookingId),
    { $set: { note: note || '' } },
    { new: true }
  );

  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  return booking.toObject();
}

async function listBookings({ status, from, to, limit = 50, skip = 0 }) {
  const query = {};
  if (status) query.status = status;

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = toDate(from, 'from');
    if (to) query.createdAt.$lte = toDate(to, 'to');
  }

  const items = await Booking.find(query)
    .sort({ createdAt: -1 })
    .skip(Math.max(0, Number(skip) || 0))
    .limit(Math.min(200, Math.max(1, Number(limit) || 50)))
    .populate('customer_id')
    .lean();

  return items;
}

async function getRoomCalendar({ roomId, from, to }) {
  if (!mongoose.isValidObjectId(roomId)) {
    const err = new Error('Invalid roomId');
    err.statusCode = 400;
    throw err;
  }

  const start = from ? toDate(from, 'from') : new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const end = to ? toDate(to, 'to') : new Date(Date.now() + 1000 * 60 * 60 * 24 * 90);

  return Booking.find({
    status: { $ne: 'cancelled' },
    'rooms.room_id': roomId,
    check_in: { $lt: end },
    check_out: { $gt: start }
  })
    .sort({ check_in: 1 })
    .populate('customer_id')
    .lean();
}

async function getBookingStats({ from, to }) {
  const start = from ? toDate(from, 'from') : new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const end = to ? toDate(to, 'to') : new Date();

  const match = {
    createdAt: { $gte: start, $lte: end }
  };

  const byStatus = await Booking.aggregate([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const [totals] = await Booking.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        totalDeposits: { $sum: '$depositAmount' }
      }
    }
  ]);

  return {
    range: { from: start, to: end },
    byStatus,
    totals: totals || null
  };
}

async function createManualBooking({ customer, roomIds, checkIn, checkOut, guests, note, confirmImmediately = false }) {
  const booking = await createBooking({ customer, roomIds, checkIn, checkOut, guests, note });
  if (!confirmImmediately) return booking;

  await Booking.findByIdAndUpdate(booking._id, { $set: { status: 'confirmed', holdExpiresAt: null } });
  return Booking.findById(booking._id)
    .populate('customer_id')
    .populate({ path: 'rooms.room_id', populate: { path: 'room_type_id' } })
    .lean();
}

module.exports = {
  buildIdConditions,
  expireStalePendingBookings,
  createBooking,
  createManualBooking,
  searchBookings,
  getBookingById,
  assertGuestCanAccess,
  cancelPendingWithoutRefund,
  adminUpdateBookingStatus,
  adminAddExtraCharges,
  adminAddNote,
  listBookings,
  getRoomCalendar,
  getBookingStats
};
