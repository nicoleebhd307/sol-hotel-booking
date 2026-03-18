const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');
const Account = require('../models/Account');

function getTokenFromRequest(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token;
}

async function authMiddleware(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: 'Missing Authorization Bearer token' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Server auth not configured (JWT_SECRET missing)' });
    }

    const payload = jwt.verify(token, secret);
    if (!payload?.staffId || !payload?.accountId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const [staff, account] = await Promise.all([
      Staff.findById(payload.staffId).lean(),
      Account.findById(payload.accountId).lean()
    ]);

    if (!staff || !account) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (account.status !== 'active') {
      return res.status(403).json({ message: 'Account disabled' });
    }

    req.user = {
      staffId: staff._id,
      accountId: account._id,
      role: staff.role,
      name: staff.name,
      email: staff.email
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = authMiddleware;
