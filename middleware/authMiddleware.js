const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // --- TAMBAHAN LOGGING (CCTV) ---
  console.log(`[AUTH DEBUG] Header masuk: ${authHeader}`);

  if (!authHeader) {
    console.log("[AUTH DEBUG] Gagal: Header kosong");
    return res.status(401).json({ error: 'Token tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token || token === 'undefined') { // Cek string "undefined" juga
    console.log("[AUTH DEBUG] Gagal: Token undefined/kosong");
    return res.status(401).json({ error: 'Token kosong/undefined' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(`[AUTH DEBUG] Sukses! User ID: ${decoded.id}`);
    next();
  } catch (err) {
    console.error(`[AUTH DEBUG] Gagal Verifikasi: ${err.message}`);
    res.status(401).json({ error: 'Token tidak valid', details: err.message });
  }
};

module.exports = authMiddleware;