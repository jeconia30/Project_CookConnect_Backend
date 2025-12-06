const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');

// POST /api/interactions/like
router.post('/like', interactionController.toggleLike);

// POST /api/interactions/save
router.post('/save', interactionController.toggleSave);

module.exports = router;