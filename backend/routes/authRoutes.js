const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const Staff = require('../models/Staff');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

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

// POST /api/auth/login  — Admin FE sends { email, password }
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const emailTrimmed = String(email).trim().toLowerCase();

    // 1) Try finding Staff by staff email
    let staff = await Staff.findOne({ email: emailTrimmed }).lean();
    let account;

    if (staff) {
      account = await Account.findById(staff.account_id).catch(() => null);
      // account_id may be stored as string — fallback to string query
      if (!account) account = await Account.findOne({ _id: staff.account_id });
    } else {
      // 2) Fallback: find Account by its own email field, then look up Staff
      account = await Account.findOne({ email: emailTrimmed });
      if (account) {
        staff = await Staff.findOne({
          $or: [
            { account_id: account._id },
            { account_id: String(account._id) }
          ]
        }).lean();
      }
    }

    if (!staff || !account) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (account.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account disabled' });
    }

    // Support both hashed (passwordHash) and legacy plaintext (password) fields
    const storedHash = account.passwordHash;
    const storedPlain = account.password;
    let ok = false;
    if (storedHash) {
      ok = await bcrypt.compare(String(password), storedHash);
    } else if (storedPlain) {
      ok = String(password) === String(storedPlain);
    }
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken({ staffId: staff._id, accountId: account._id, role: staff.role });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: staff._id,
        email: staff.email,
        role: staff.role,
        name: staff.name,
        profileImage: '/assets/images/admin-profile.png',
        token,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/profile
router.get('/profile', authMiddleware, (req, res) => {
  const user = req.user;
  return res.json({
    success: true,
    message: 'Profile retrieved',
    data: {
      id: user.staffId,
      email: user.email,
      role: user.role,
      name: user.name,
      profileImage: '/assets/images/admin-profile.png',
    },
  });
});

module.exports = router;
