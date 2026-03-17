const users = require('../mockData/users');

function extractTokenFromHeader(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }

  if (!authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice(7).trim();
}

function getUserFromToken(token) {
  if (!token) {
    return null;
  }

  const parts = token.split('_');
  if (parts.length < 3 || parts[0] !== 'token') {
    return null;
  }

  const userId = Number(parts[1]);
  if (!Number.isFinite(userId)) {
    return null;
  }

  const user = users.find((entry) => entry.id === userId);
  return user || null;
}

function requireAuth(req, res, next) {
  const token = extractTokenFromHeader(req.headers.authorization);
  const user = getUserFromToken(token);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  req.token = token;
  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    profileImage: user.profileImage,
  };

  next();
}

function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};
