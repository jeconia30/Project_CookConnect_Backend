const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ TAMBAHKAN AUTH

// GET /api/notifications/:user_id -> Ambil notifikasi user (HARUS LOGIN)
router.get('/:user_id', authMiddleware, notificationController.getMyNotifications);

module.exports = router;