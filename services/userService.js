// services/userService.js
const pool = require('../config/db');

// Ambil semua user
const getAllUsers = async () => {
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
};

// UPDATE USER (Versi Lengkap dengan Avatar)
const updateUser = async (id, data) => {
  // Tambahkan avatar_url disini
  const { full_name, bio, link_tiktok, link_instagram, avatar_url } = data; 
  
  const query = `
    UPDATE users 
    SET full_name = $1, bio = $2, link_tiktok = $3, link_instagram = $4, avatar_url = $5
    WHERE id = $6
    RETURNING *
  `;
  
  // Masukkan avatar_url ke urutan $5, dan id ke $6
  const values = [full_name, bio, link_tiktok, link_instagram, avatar_url, id];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Delete user
const deleteUser = async (id) => {
  const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = { getAllUsers, updateUser, deleteUser };