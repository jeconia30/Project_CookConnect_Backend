const { supabase } = require('../config/supabaseClient');

const createNotification = async (receiver_id, sender_id, type, message, recipe_id = null) => {
  if (receiver_id === sender_id) return; // Jangan notif diri sendiri

  try {
    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: receiver_id,
          sender_id: sender_id,
          type: type,
          message: message,
          recipe_id: recipe_id
        }
      ]);

    if (error) throw error;
  } catch (error) {
    console.error('Gagal membuat notifikasi:', error.message);
    // Tidak throw error agar flow utama tidak terhenti hanya karena notifikasi gagal
  }
};

const getUserNotifications = async (userId) => {
  try {
    // Join ke tabel users untuk ambil info pengirim (sender)
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:sender_id (
          username,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format data agar sesuai dengan frontend (mengeluarkan username dari object sender)
    return (data || []).map(n => ({
      ...n,
      username: n.sender?.username || 'Unknown',
      avatar_url: n.sender?.avatar_url
    }));
  } catch (error) {
    throw error;
  }
};

const markAsRead = async (notifId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

module.exports = { createNotification, getUserNotifications, markAsRead };