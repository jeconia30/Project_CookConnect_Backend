const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ TAMBAHKAN AUTH

// POST /api/interactions/like -> Toggle Like (HARUS LOGIN)
router.post('/like', authMiddleware, interactionController.toggleLike);

// POST /api/interactions/save -> Toggle Save (HARUS LOGIN)
router.post('/save', authMiddleware, interactionController.toggleSave);

module.exports = router;