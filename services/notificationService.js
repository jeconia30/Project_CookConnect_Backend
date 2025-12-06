// services/notificationService.js
const pool = require('../config/db');

const createNotification = async (receiver_id, sender_id, type, message, recipe_id = null) => {
  if (receiver_id === sender_id) return; // Jangan notif diri sendiri
  
  const query = `
    INSERT INTO notifications (user_id, sender_id, type, message, recipe_id)
    VALUES ($1, $2, $3, $4, $5)
  `;
  await pool.query(query, [receiver_id, sender_id, type, message, recipe_id]);
};

const getUserNotifications = async (userId) => {
  const query = `
    SELECT n.*, u.username, u.avatar_url 
    FROM notifications n
    JOIN users u ON n.sender_id = u.id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Tandai notif sudah dibaca (opsional, buat nanti)
const markAsRead = async (notifId) => {
    await pool.query('UPDATE notifications SET is_read = true WHERE id = $1', [notifId]);
}

module.exports = { createNotification, getUserNotifications, markAsRead };