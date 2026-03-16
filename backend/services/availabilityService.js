const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { toDate } = require('../utils/dateUtils');

function getNow() {
  return new Date();
}

async function findBookedRoomIds({ checkIn, checkOut }) {
  const inDate = toDate(checkIn, 'check_in');
  const outDate = toDate(checkOut, 'check_out');
  const now = getNow();

  const bookings = await Booking.find({
    status: { $ne: 'cancelled' },
    check_in: { $lt: outDate },
    check_out: { $gt: inDate },
    $or: [
      { status: { $ne: 'pending' } },
      { status: 'pending', holdExpiresAt: { $gt: now } }
    ]
  }).select('rooms.room_id');

  const bookedRoomIds = new Set();
  for (const booking of bookings) {
    for (const room of booking.rooms || []) {
      if (room?.room_id) bookedRoomIds.add(String(room.room_id));
    }
  }

  return Array.from(bookedRoomIds);
}

async function getAvailableRooms({ checkIn, checkOut, roomTypeId }) {
  const bookedRoomIds = await findBookedRoomIds({ checkIn, checkOut });

  const roomQuery = {
    is_active: true,
    status: 'available',
    ...(roomTypeId ? { room_type_id: roomTypeId } : {}),
    ...(bookedRoomIds.length > 0 ? { _id: { $nin: bookedRoomIds } } : {})
  };

  return Room.find(roomQuery).populate('room_type_id').lean();
}

module.exports = {
  getAvailableRooms,
  findBookedRoomIds
};
