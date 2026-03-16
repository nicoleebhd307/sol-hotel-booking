const mongoose = require('mongoose');
const RoomType = require('../models/RoomType');
const Room = require('../models/Room');
const availabilityService = require('../services/availabilityService');

async function listRoomTypes(req, res, next) {
  try {
    const items = await RoomType.find({}).sort({ name: 1 }).lean();
    return res.json(items);
  } catch (err) {
    return next(err);
  }
}

async function getRoomType(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid room type id' });
    }
    const item = await RoomType.findById(id).lean();
    if (!item) return res.status(404).json({ message: 'Room type not found' });
    return res.json(item);
  } catch (err) {
    return next(err);
  }
}

async function listRooms(req, res, next) {
  try {
    const { roomTypeId } = req.query;
    const query = { is_active: true };
    if (roomTypeId) {
      if (!mongoose.isValidObjectId(roomTypeId)) {
        return res.status(400).json({ message: 'Invalid roomTypeId' });
      }
      query.room_type_id = roomTypeId;
    }
    const rooms = await Room.find(query).populate('room_type_id').sort({ room_number: 1 }).lean();
    return res.json(rooms);
  } catch (err) {
    return next(err);
  }
}

async function getAvailableRooms(req, res, next) {
  try {
    const { checkIn, checkOut, roomTypeId } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: 'checkIn and checkOut are required' });
    }

    if (roomTypeId && !mongoose.isValidObjectId(roomTypeId)) {
      return res.status(400).json({ message: 'Invalid roomTypeId' });
    }

    const rooms = await availabilityService.getAvailableRooms({
      checkIn,
      checkOut,
      roomTypeId
    });

    return res.json({
      checkIn,
      checkOut,
      count: rooms.length,
      rooms
    });
  } catch (err) {
    err.statusCode = err.statusCode || 400;
    return next(err);
  }
}

module.exports = {
  listRoomTypes,
  getRoomType,
  listRooms,
  getAvailableRooms
};
