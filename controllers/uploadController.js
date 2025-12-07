const { supabase } = require('../config/supabaseClient');
const path = require('path');
const fs = require('fs');

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File tidak ditemukan' });
    }

    const userId = req.user.id;
    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const fileName = `${userId}-${Date.now()}${fileExt}`;

    // Upload ke Supabase Storage - bucket "avatar"
    const { data, error } = await supabase.storage
      .from('avatar')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    // Dapatkan public URL
    const { data: publicUrl } = supabase.storage
      .from('avatar')
      .getPublicUrl(fileName);

    // Update user profile dengan avatar URL
    await supabase
      .from('users')
      .update({ avatar_url: publicUrl.publicUrl })
      .eq('id', userId);

    res.json({
      message: 'Avatar berhasil diupload',
      url: publicUrl.publicUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
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

    // Upload ke Supabase Storage - bucket "masakan-images"
    const { data, error } = await supabase.storage
      .from('masakan-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    // Dapatkan public URL
    const { data: publicUrl } = supabase.storage
      .from('masakan-images')
      .getPublicUrl(fileName);

    res.json({
      message: 'Gambar resep berhasil diupload',
      url: publicUrl.publicUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadAvatar, uploadRecipeImage };