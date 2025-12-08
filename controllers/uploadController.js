const { supabaseAdmin } = require('../config/supabaseClient');
const path = require('path');

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File tidak ditemukan' });
    }

    const userId = req.user.id;
    const file = req.file;
    const fileExt = path.extname(file.originalname);
    // Nama file unik: userID-timestamp.ext
    const fileName = `${userId}-${Date.now()}${fileExt}`;

    // 1. Upload ke Supabase Storage menggunakan supabaseAdmin (Bypass RLS)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true // Timpa jika ada file dengan nama sama
      });

    if (uploadError) throw uploadError;

    // 2. Dapatkan public URL (Gunakan method yang benar)
    const { data } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(fileName);
      
    const publicUrl = data.publicUrl;

    // 3. Update user profile di database menggunakan supabaseAdmin
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (dbError) throw dbError;

    res.json({
      message: 'Avatar berhasil diupload',
      url: publicUrl,
    });
  } catch (error) {
    console.error('Upload Avatar Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const uploadRecipeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File tidak ditemukan' });
    }

    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const fileName = `recipe-${Date.now()}${fileExt}`;

    // 1. Upload ke Supabase Storage (Admin)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('masakan-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw uploadError;

    // 2. Dapatkan URL
    const { data } = supabaseAdmin.storage
      .from('masakan-images')
      .getPublicUrl(fileName);

    res.json({
      message: 'Gambar resep berhasil diupload',
      url: data.publicUrl,
    });
  } catch (error) {
    console.error('Upload Recipe Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadAvatar, uploadRecipeImage };