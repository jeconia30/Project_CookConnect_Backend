// controllers/authController.js
const authService = require('../services/authService');

const register = async (req, res) => {
  try {
    const newUser = await authService.registerUser(req.body);
    
    res.status(201).json({
      message: "Register Berhasil! Silakan Login.",
      user: newUser
    });
  } catch (error) {
    // Kalau errornya karena duplikat email
    if (error.message === 'Username atau Email sudah terdaftar!') {
      return res.status(400).json({ error: error.message });
    }
    // Error lain (server)
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const user = await authService.login(req.body);

    res.json({
      message: "Login Berhasil! Selamat datang.",
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    // Balas error dengan status 401 (Unauthorized)
    res.status(401).json({ error: error.message });
  }
};

module.exports = { register, login };