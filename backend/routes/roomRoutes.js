const express = require('express');
const roomController = require('../controllers/roomController');

const router = express.Router();

router.get('/types', roomController.listRoomTypes);
router.get('/types/:id', roomController.getRoomType);
router.get('/available', roomController.getAvailableRooms);
router.get('/', roomController.listRooms);
router.get('/:id', roomController.getRoomById);

module.exports = router;
