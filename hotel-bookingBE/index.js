const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking.routes');

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Hotel Booking Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Server configuration
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║  Hotel Booking Backend API Running    ║
║  Port: ${PORT}                            ║
║  CORS: Enabled for localhost:4200     ║
║  Health Check: GET /api/health        ║
╚═══════════════════════════════════════╝
  `);
});

module.exports = app;
