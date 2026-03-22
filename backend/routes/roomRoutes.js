const express = require('express');
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/types', roomController.listRoomTypes);
router.get('/types/:id', roomController.getRoomType);
router.get('/available', roomController.getAvailableRooms);
router.get('/', roomController.listRooms);
router.get('/:id', roomController.getRoomById);
router.patch('/:id', authMiddleware, roomController.updateRoom);

module.exports = router;
