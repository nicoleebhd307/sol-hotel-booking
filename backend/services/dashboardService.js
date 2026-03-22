const Booking = require('../models/Booking');
const Room = require('../models/Room');
const RoomType = require('../models/RoomType');
const Payment = require('../models/Payment');
const { startOfDayUtc } = require('../utils/dateUtils');

async function getSummary() {
  const todayStart = startOfDayUtc(new Date());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [todayBookings, todayCheckIns, todayCheckOuts, availableRooms] = await Promise.all([
    Booking.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } }),
    Booking.countDocuments({ check_in: { $gte: todayStart, $lt: todayEnd }, status: { $in: ['confirmed', 'checked_in'] } }),
    Booking.countDocuments({ check_out: { $gte: todayStart, $lt: todayEnd }, status: { $in: ['checked_out', 'completed'] } }),
    Room.countDocuments({ status: 'available', is_active: true }),
  ]);

  return {
    totalBookingsToday: todayBookings,
    checkIn: todayCheckIns,
    checkOut: todayCheckOuts,
    availableRooms,
    bookingStats: { percentage: 12, trend: 'up' },
    checkInStats: { percentage: 5, trend: 'up' },
    checkOutStats: { percentage: 22, trend: 'up' },
    availableRoomsStats: { percentage: -2, trend: 'down' },
  };
}

async function getCheckIns() {
  const todayStart = startOfDayUtc(new Date());

  // Upcoming confirmed bookings — check_in from today onwards, waiting to be checked in
  const bookings = await Booking.find({
    check_in: { $gte: todayStart },
    status: 'confirmed',
  })
    .populate('customer_id')
    .populate({ path: 'rooms.room_id', populate: { path: 'room_type_id' } })
    .sort({ check_in: 1 })
    .limit(10)
    .lean();

  return bookings.map((b, i) => {
    const room = b.rooms?.[0]?.room_id;
    const roomType = room?.room_type_id;
    return {
      bookingId: String(b._id),
      id: i + 1,
      guestName: b.customer_id?.name || 'Guest',
      room: room?.room_number ? `Room ${room.room_number}` : '-',
      time: new Date(b.check_in).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      roomType: roomType?.name || 'Standard',
      status: b.status,
    };
  });
}

async function getCheckOuts() {
  const todayStart = startOfDayUtc(new Date());

  // Currently checked-in guests with check-out from today onwards — these need to be checked out
  const bookings = await Booking.find({
    check_out: { $gte: todayStart },
    status: 'checked_in',
  })
    .populate('customer_id')
    .populate({ path: 'rooms.room_id', populate: { path: 'room_type_id' } })
    .sort({ check_out: 1 })
    .limit(10)
    .lean();

  return bookings.map((b, i) => {
    const room = b.rooms?.[0]?.room_id;
    return {
      bookingId: String(b._id),
      id: i + 1,
      guestName: b.customer_id?.name || 'Guest',
      room: room?.room_number ? `Room ${room.room_number}` : '-',
      status: b.status,
      amount: b.totalPrice || 0,
      checkoutTime: new Date(b.check_out).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    };
  });
}

async function getRoomAvailability() {
  const roomTypes = await RoomType.find({}).lean();
  const results = [];

  for (const rt of roomTypes) {
    const total = await Room.countDocuments({ room_type_id: rt._id, is_active: true });
    const available = await Room.countDocuments({ room_type_id: rt._id, is_active: true, status: 'available' });
    const percentage = total > 0 ? Math.round((available / total) * 100) : 0;

    results.push({
      roomType: rt.name,
      available,
      total,
      percentage,
    });
  }

  return results;
}

async function getManagerSummary() {
  const todayStart = startOfDayUtc(new Date());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [todayPayments, totalRooms, occupiedRooms, pendingBookings] = await Promise.all([
    Payment.aggregate([
      { $match: { paymentStatus: 'success', createdAt: { $gte: todayStart, $lt: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Room.countDocuments({ is_active: true }),
    Room.countDocuments({ is_active: true, status: 'occupied' }),
    Booking.countDocuments({ status: 'pending' }),
  ]);

  const revenueToday = todayPayments[0]?.total || 0;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const averageDailyRate = occupiedRooms > 0 ? Math.round(revenueToday / occupiedRooms) : 0;

  return {
    revenueToday,
    occupancyRate,
    averageDailyRate,
    pendingApprovals: pendingBookings,
    revenueStats: { percentage: 8, trend: 'up' },
    occupancyStats: { percentage: 4, trend: 'up' },
    averageRateStats: { percentage: 3, trend: 'up' },
    pendingStats: { percentage: 2, trend: 'down' },
  };
}

module.exports = {
  getSummary,
  getCheckIns,
  getCheckOuts,
  getRoomAvailability,
  getManagerSummary,
};
