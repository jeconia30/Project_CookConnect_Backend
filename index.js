const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// --- BAGIAN KONEKSI DATABASE (Dapur) ---
const pool = new Pool({
  // Pastikan .env kamu sudah berisi link yang benar (yang ada pooler-nya)
  connectionString: process.env.DATABASE_URL,
  // OBAT KUAT: Ini yang bikin koneksi gak bengong lagi!
  ssl: {
    rejectUnauthorized: false,
  },
});

// --- BAGIAN API (Menu Makanan) ---

// 1. Cek Apakah Server Hidup (Buka di browser: localhost:5000)
app.get('/', (req, res) => {
  res.send('Halo! Server Backend Resep Makanan Sudah Jalan! 🚀');
});

// 2. API: Ambil Semua User (Buka di browser: localhost:5000/api/users)
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows); // Mengirim data user ke React
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 3. API: Ambil Semua Resep (Buka di browser: localhost:5000/api/recipes)
app.get('/api/recipes', async (req, res) => {
  try {
    // Kita ambil data resep + nama user yang buat
    const query = `
      SELECT recipes.*, users.username, users.avatar_url 
      FROM recipes 
      JOIN users ON recipes.user_id = users.id
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Jalankan Server
app.listen(port, () => {
  console.log(`🚀 Server jalan di http://localhost:${port}`);
  
  // Tes koneksi langsung begitu server nyala
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Masih Gagal Konek:', err.message);
    } else {
      console.log('✅ BERHASIL KONEK KE SUPABASE! Hore!');
    }
  });
});