const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');

const { connectDb } = require('./config/db');

const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const customerRoutes = require('./routes/customerRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const bookingService = require('./services/bookingService');


const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);  // plural — legacy
app.use('/api/payment',  paymentRoutes);  // singular — MoMo ATM Web Payment integration
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const message = (status >= 500 && process.env.NODE_ENV === 'production')
    ? 'Internal server error'
    : err.message;

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({ message });
});

async function start() {
  const port = process.env.PORT || 5000;
  await connectDb();

  const server = http.createServer(app);
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      // eslint-disable-next-line no-console
      console.error(`Port ${port} is already in use. Stop the other process or set PORT in backend/.env`);
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.error('Server error:', err);
    process.exit(1);
  });

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${port}`);
  });

  const intervalMs = 5 * 60 * 1000;
  const interval = setInterval(() => {
    bookingService.expireStalePendingBookings().catch(() => {});
  }, intervalMs);
  interval.unref();

  const shutdown = async (signal) => {
    // eslint-disable-next-line no-console
    console.log(`Received ${signal}. Shutting down...`);
    clearInterval(interval);
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
