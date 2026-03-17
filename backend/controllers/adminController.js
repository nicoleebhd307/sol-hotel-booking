const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const bookingService = require('../services/bookingService');
const refundService = require('../services/refundService');

function signToken({ accountId, role, email }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error('JWT_SECRET is required');
    err.statusCode = 500;
    throw err;
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '12h';
  return jwt.sign({ accountId, role, email }, secret, { expiresIn });
}

async function verifyPassword(inputPassword, storedPassword) {
  if (!storedPassword) return false;

  const isHash = /^\$2[aby]\$\d{2}\$/.test(String(storedPassword));
  if (isHash) {
    return bcrypt.compare(String(inputPassword), String(storedPassword));
  }

  return String(inputPassword) === String(storedPassword);
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const account = await Account.findOne({ email: String(email).trim().toLowerCase() });
    if (!account) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (account.status !== 'active') {
      return res.status(403).json({ message: 'Account disabled' });
    }

    const ok = await verifyPassword(password, account.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken({ accountId: account._id, role: account.role, email: account.email });

    return res.json({
      token,
      account: {
        id: account._id,
        role: account.role,
        email: account.email,
        name: String(account.email).split('@')[0]
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
