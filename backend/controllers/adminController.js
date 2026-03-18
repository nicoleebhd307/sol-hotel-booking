const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const Staff = require('../models/Staff');
const bookingService = require('../services/bookingService');
const refundService = require('../services/refundService');

function signToken({ staffId, accountId, role }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error('JWT_SECRET is required');
    err.statusCode = 500;
    throw err;
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '12h';
  return jwt.sign({ staffId, accountId, role }, secret, { expiresIn });
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    const account = await Account.findOne({ username: String(username).trim() });
    if (!account) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (account.status !== 'active') {
      return res.status(403).json({ message: 'Account disabled' });
    }

    const ok = await bcrypt.compare(String(password), account.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const staff = await Staff.findOne({ account_id: account._id }).lean();
    if (!staff) {
      return res.status(403).json({ message: 'Staff record not found' });
    }

    const token = signToken({ staffId: staff._id, accountId: account._id, role: staff.role });

    return res.json({
      token,
      staff: {
        id: staff._id,
        role: staff.role,
        name: staff.name,
        email: staff.email
      }
    });
  } catch (err) {
    return next(err);
  }
}

async function listBookings(req, res, next) {
  try {
    const { status, from, to, limit, skip } = req.query;
    const items = await bookingService.listBookings({ status, from, to, limit, skip });
    return res.json({ count: items.length, items });
  } catch (err) {
    return next(err);
  }
}

async function getBookingDetails(req, res, next) {
  try {
    const { id } = req.params;
    const data = await bookingService.getBookingById(id);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

async function createManualBooking(req, res, next) {
  try {
    const { customer, roomIds, check_in, check_out, guests, note, confirmImmediately } = req.body || {};

    const booking = await bookingService.createManualBooking({
      customer,
      roomIds,
      checkIn: check_in,
      checkOut: check_out,
      guests,
      note,
      confirmImmediately: Boolean(confirmImmediately)
    });

    return res.status(201).json(booking);
  } catch (err) {
    return next(err);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;

    const { booking } = await bookingService.getBookingById(id);

    if (booking.status === 'pending') {
      const cancelled = await bookingService.cancelPendingWithoutRefund(id);
      return res.json({ booking: cancelled, refund: { refundAmount: 0 } });
    }

    const result = await refundService.cancelBookingWithPolicy({ bookingId: id });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function confirmCheckIn(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await bookingService.adminUpdateBookingStatus(id, 'checked_in');
    return res.json({ booking: updated });
  } catch (err) {
    return next(err);
  }
}

async function confirmCheckOut(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await bookingService.adminUpdateBookingStatus(id, 'checked_out');
    return res.json({ booking: updated });
  } catch (err) {
    return next(err);
  }
}

async function addExtraCharges(req, res, next) {
  try {
    const { id } = req.params;
    const { extraCharge } = req.body || {};
    const updated = await bookingService.adminAddExtraCharges(id, extraCharge);
    return res.json({ booking: updated });
  } catch (err) {
    return next(err);
  }
}

async function addNote(req, res, next) {
  try {
    const { id } = req.params;
    const { note } = req.body || {};
    const updated = await bookingService.adminAddNote(id, note);
    return res.json({ booking: updated });
  } catch (err) {
    return next(err);
  }
}

async function getRoomCalendar(req, res, next) {
  try {
    const { roomId, from, to } = req.query;
    const items = await bookingService.getRoomCalendar({ roomId, from, to });
    return res.json({ count: items.length, items });
  } catch (err) {
    return next(err);
  }
}

async function getBookingStats(req, res, next) {
  try {
    const { from, to } = req.query;
    const stats = await bookingService.getBookingStats({ from, to });
    return res.json(stats);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
  listBookings,
  getBookingDetails,
  createManualBooking,
  cancelBooking,
  confirmCheckIn,
  confirmCheckOut,
  addExtraCharges,
  addNote,
  getRoomCalendar,
  getBookingStats
};
