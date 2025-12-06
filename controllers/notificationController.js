const notifService = require('../services/notificationService');

const getMyNotifications = async (req, res) => {
  try {
    const { user_id } = req.params; // Nanti ambil ID user yg login
    const notifs = await notifService.getUserNotifications(user_id);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMyNotifications };