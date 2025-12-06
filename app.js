// app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db'); // Import koneksi db buat tes

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// --- IMPORT ROUTES (Nanti kita aktifkan satu per satu) ---
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// --- GUNAKAN ROUTES ---
app.get('/', (req, res) => {
  res.send('Server MVC CookConnect Siap! 👨‍🍳');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/interactions', require('./routes/interactionRoutes'));
app.use('/api/notifications', notificationRoutes);

// Jalankan Server
app.listen(port, () => {
  console.log(`🚀 Server MVC jalan di http://localhost:${port}`);
  
  // Tes koneksi db sebentar
  pool.query('SELECT NOW()', (err) => {
    if (err) console.error('❌ DB Gagal:', err.message);
    else console.log('✅ DB Konek!');
  });
});