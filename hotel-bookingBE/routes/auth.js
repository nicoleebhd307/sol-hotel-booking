const express = require('express');
const router = express.Router();
const users = require('../mockData/users');
const { requireAuth } = require('../middleware/auth.middleware');

/**
 * POST /api/auth/login
 * Login endpoint - validates credentials and returns user with token
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Find user by email and password
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Return user info (without password)
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      ...userWithoutPassword,
      token: `token_${user.id}_${Date.now()}` // Simple mock token
    }
  });
});

/**
 * POST /api/auth/logout
 * Logout endpoint
 */
router.post('/logout', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Profile retrieved',
    data: req.user
  });
});

module.exports = router;
