// services/authService.js
const pool = require("../config/db");

const registerUser = async (userData) => {
  const { username, email, password, full_name } = userData;

  // 1. Cek apakah username/email sudah ada
  const checkQuery = "SELECT * FROM users WHERE email = $1 OR username = $2";
  const checkResult = await pool.query(checkQuery, [email, username]);

  if (checkResult.rows.length > 0) {
    throw new Error("Username atau Email sudah terdaftar!");
  }

  // 2. Kalau aman, masukkan ke database
  const query = `
    INSERT INTO users (username, email, password, full_name) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `;
  const result = await pool.query(query, [
    username,
    email,
    password,
    full_name,
  ]);

  return result.rows[0];
};

const login = async (loginData) => {
  const { email, password } = loginData;

  // 1. Cari user berdasarkan email
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);

  // 2. Kalau user tidak ditemukan
  if (result.rows.length === 0) {
    throw new Error("Email tidak ditemukan!");
  }

  const user = result.rows[0];

  // 3. Cek apakah password cocok
  // (Catatan: Untuk pemula kita bandingkan langsung text-nya. 
  // Nanti kalau sudah pro, wajib pakai enkripsi/hashing ya!)
  if (user.password !== password) {
    throw new Error('Password salah!');
  }

  // 4. Kalau cocok semua, kembalikan data user
  return user;
};

module.exports = { registerUser, login };
