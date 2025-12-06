const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notificationController');

// GET /api/notifications/:user_id
router.get('/:user_id', notifController.getMyNotifications);

module.exports = router;