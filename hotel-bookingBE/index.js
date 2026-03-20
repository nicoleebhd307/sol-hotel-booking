const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Load mock data
const roomTypesPath = path.join(__dirname, 'data', 'room-types.json');
const roomsPath = path.join(__dirname, 'data', 'rooms.json');
const bookingsPath = path.join(__dirname, 'data', 'bookings.json');

let roomTypes = [];
let rooms = [];
let bookings = [];

try {
  roomTypes = JSON.parse(fs.readFileSync(roomTypesPath, 'utf-8'));
  rooms = JSON.parse(fs.readFileSync(roomsPath, 'utf-8'));
  bookings = JSON.parse(fs.readFileSync(bookingsPath, 'utf-8'));
} catch (error) {
  console.error('Error loading mock data:', error);
}

// Routes

// Get all room types
app.get('/api/room-types', (req, res) => {
  res.json({
    success: true,
    data: roomTypes
  });
});

// Get room type by ID
app.get('/api/room-types/:id', (req, res) => {
  const roomType = roomTypes.find(rt => rt._id === req.params.id);
  if (!roomType) {
    return res.status(404).json({
      success: false,
      message: 'Room type not found'
    });
  }
  res.json({
    success: true,
    data: roomType
  });
});

// Get all rooms
app.get('/api/rooms', (req, res) => {
  const query = req.query;
  let filteredRooms = rooms;

  // Filter by status if provided
  if (query.status) {
    filteredRooms = filteredRooms.filter(room => room.status === query.status);
  }

  // Filter by is_active if provided
  if (query.is_active !== undefined) {
    filteredRooms = filteredRooms.filter(room => room.is_active === (query.is_active === 'true'));
  }

  // Filter by beach_view if provided
  if (query.beach_view !== undefined) {
    filteredRooms = filteredRooms.filter(room => room.beach_view === (query.beach_view === 'true'));
  }

  // Populate room type details
  const roomsWithDetails = filteredRooms.map(room => {
    const roomType = roomTypes.find(rt => rt._id === room.room_type_id);
    return {
      ...room,
      roomType: roomType
    };
  });

  res.json({
    success: true,
    data: roomsWithDetails,
    total: roomsWithDetails.length
  });
});

// Get available rooms
app.get('/api/rooms/available', (req, res) => {
  const availableRooms = rooms.filter(room => room.status === 'available' && room.is_active);
  
  const roomsWithDetails = availableRooms.map(room => {
    const roomType = roomTypes.find(rt => rt._id === room.room_type_id);
    return {
      ...room,
      roomType: roomType
    };
  });

  res.json({
    success: true,
    data: roomsWithDetails,
    total: roomsWithDetails.length
  });
});

// Get room by ID
app.get('/api/rooms/:id', (req, res) => {
  const room = rooms.find(r => r._id === req.params.id);
  if (!room) {
    return res.status(404).json({
      success: false,
      message: 'Room not found'
    });
  }

  const roomType = roomTypes.find(rt => rt._id === room.room_type_id);
  const roomWithDetails = {
    ...room,
    roomType: roomType
  };

  res.json({
    success: true,
    data: roomWithDetails
  });
});

// Search booking by ID
app.get('/api/bookings/search/:bookingId', (req, res) => {
  const bookingId = req.params.bookingId.toUpperCase();
  const booking = bookings.find(b => b.bookingId.toUpperCase() === bookingId);
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: `No booking found with ID: ${req.params.bookingId}`
    });
  }

  res.json({
    success: true,
    data: booking
  });
});

// Get booking by ID
app.get('/api/bookings/:id', (req, res) => {
  const booking = bookings.find(b => b._id === req.params.id);
  
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  res.json({
    success: true,
    data: booking
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
  console.log(`Room types loaded: ${roomTypes.length}`);
  console.log(`Rooms loaded: ${rooms.length}`);
  console.log(`Bookings loaded: ${bookings.length}`);
});
