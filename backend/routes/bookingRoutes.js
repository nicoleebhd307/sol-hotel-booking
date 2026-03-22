const express = require('express');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');
const BookingDraft = require('../models/BookingDraft');
const { expireStalePendingBookings } = require('../services/bookingService');

// Statuses managed in booking management (only paid/active bookings)
const MANAGED_STATUSES = ['confirmed', 'checked_in', 'checked_out', 'completed'];

const router = express.Router();

// --- Draft endpoints (must be before /:id to avoid route conflicts) ---

// POST /api/bookings/drafts — save booking draft
router.post('/drafts', authMiddleware, async (req, res, next) => {
  try {
    const { draftId, selectedRoomId, formValue } = req.body || {};
    const staffId = req.user?.staffId;

    if (draftId) {
      const updated = await BookingDraft.findByIdAndUpdate(
        draftId,
        { $set: { selectedRoomId, formValue, staffId, updatedAt: new Date() } },
        { new: true }
      ).lean();
      if (updated) {
        return res.json({ success: true, data: updated });
      }
    }

    const draft = await BookingDraft.create({ staffId, selectedRoomId, formValue, updatedAt: new Date() });
    return res.status(201).json({ success: true, data: draft.toObject() });
  } catch (err) {
    return next(err);
  }
});

// GET /api/bookings/drafts/latest — get latest draft for current staff
router.get('/drafts/latest', authMiddleware, async (req, res, next) => {
  try {
    const staffId = req.user?.staffId;
    const draft = await BookingDraft.findOne({ staffId }).sort({ updatedAt: -1 }).lean();
    return res.json({ success: true, data: draft || null });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/bookings/drafts/:id — delete a draft
router.delete('/drafts/:id', authMiddleware, async (req, res, next) => {
  try {
    await BookingDraft.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

// --- Existing routes (unchanged) ---
router.post('/', bookingController.createBooking);
router.get('/search/:query', bookingController.searchBookings);

// --- Admin FE compatible: GET /api/bookings — list all bookings (active/paid only) ---
router.get('/', async (req, res, next) => {
  try {
    // Auto-cancel any pending bookings whose 30-min hold has expired
    await expireStalePendingBookings();

    const items = await Booking.find({ status: { $in: MANAGED_STATUSES } })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('customer_id')
      .populate({ path: 'rooms.room_id', populate: { path: 'room_type_id' } })
      .lean();

    const data = items.map(b => {
      const customer = b.customer_id || {};
      const room = b.rooms?.[0]?.room_id;
      const roomType = room?.room_type_id || room;
      return {
        _id: String(b._id),
        customer_id: String(customer._id || b.customer_id),
        guest_name: customer.name || '',
        guest_phone: customer.phone || '',
        room_type: roomType?.name || '',
        room_number: room?.room_number || '',
        rooms: (b.rooms || []).map(r => ({
          room_id: String(r.room_id?._id || r.room_id),
          price_per_night: r.price_per_night || 0,
        })),
        check_in: b.check_in ? new Date(b.check_in).toISOString().slice(0, 10) : '',
        check_out: b.check_out ? new Date(b.check_out).toISOString().slice(0, 10) : '',
        guests: (b.guests?.adults || 1) + (b.guests?.children || 0),
        totalPrice: b.totalPrice || 0,
        depositAmount: b.depositAmount || 0,
        extraCharge: b.extraCharge || 0,
        status: b.status || 'pending',
        note: b.note || '',
        createdAt: b.createdAt ? new Date(b.createdAt).toISOString().slice(0, 10) : '',
      };
    });

    return res.json(data);
  } catch (err) {
    return next(err);
  }
});

// GET /api/bookings/:id (existing)
router.get('/:id', bookingController.getBooking);

// PATCH /api/bookings/:id — update booking
router.patch('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const setFields = {};
    if (updates.check_in) setFields.check_in = new Date(updates.check_in);
    if (updates.check_out) setFields.check_out = new Date(updates.check_out);
    if (updates.status) setFields.status = updates.status;
    if (updates.note !== undefined) setFields.note = updates.note;
    if (updates.depositAmount !== undefined) setFields.depositAmount = Number(updates.depositAmount);
    if (updates.totalPrice !== undefined) setFields.totalPrice = Number(updates.totalPrice);

    if (Object.keys(setFields).length > 0) {
      await Booking.findByIdAndUpdate(id, { $set: setFields });
    }

    const booking = await Booking.findById(id)
      .populate('customer_id')
      .populate({ path: 'rooms.room_id', populate: { path: 'room_type_id' } })
      .lean();

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.json({ success: true, data: booking });
  } catch (err) {
    return next(err);
  }
});

// DELETE /api/bookings/:id — cancel booking
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await Booking.findByIdAndUpdate(id, { $set: { status: 'cancelled', cancelledAt: new Date() } }, { new: true })
      .populate('customer_id')
      .populate({ path: 'rooms.room_id', populate: { path: 'room_type_id' } })
      .lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    return next(err);
  }
});

// POST /:id/cancel (existing)
router.post('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
