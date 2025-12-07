const { supabase } = require('../config/supabaseClient');

// ✅ BARU: Ambil semua users dengan search
const getAllUsers = async (search = null) => {
  try {
    let query = supabase
      .from('users')
      .select('id, username, full_name, bio, avatar_url, link_tiktok, link_instagram');

    // Filter search jika ada
    if (search && search.trim() !== '') {
      query = query.or(
        `username.ilike.%${search}%,full_name.ilike.%${search}%`
      );
    }

    const { data, error } = await query.limit(20);

    if (error) throw error;

    return data || [];
  } catch (error) {
    throw error;
  }
};

// ✅ PERBAIKAN: Ambil profil user by username
const getUserProfile = async (username) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        full_name,
        bio,
        avatar_url,
        link_tiktok,
        link_instagram,
        link_linkedin,
        link_other,
        created_at
      `)
      .eq('username', username)
      .single();

    if (error) throw error;

    return user;
  } catch (error) {
    throw error;
  }
};

// ✅ PERBAIKAN: Update profil user
const updateUser = async (userId, updateData) => {
  try {
    const { data: updated, error } = await supabase
      .from('users')
      .update({
        full_name: updateData.full_name,
        username: updateData.username,
        bio: updateData.bio,
        avatar_url: updateData.avatar_url,
        link_tiktok: updateData.link_tiktok,
        link_instagram: updateData.link_instagram,
        link_linkedin: updateData.link_linkedin,
        link_other: updateData.link_other,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return updated;
  } catch (error) {
    throw error;
  }
};

// ✅ PERBAIKAN: Hapus user
const deleteUser = async (userId) => {
  try {
    const { data: deleted, error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return deleted;
  } catch (error) {
    throw error;
  }
};

// ✅ BARU: Ambil resep yang di-upload user
const getMyRecipes = async (userId) => {
  try {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        id,
        title,
        image_url,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return recipes || [];
  } catch (error) {
    throw error;
  }
};

// ✅ BARU: Ambil resep yang di-simpan user
const getMySavedRecipes = async (userId) => {
  try {
    const { data: savedRecipes, error } = await supabase
      .from('saves')
      .select(`
        recipe_id,
        recipes (
          id,
          title,
          image_url,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (savedRecipes || []).map(save => save.recipes).filter(Boolean);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllUsers,           // ✅ BARU
  getUserProfile,
  updateUser,
  deleteUser,
  getMyRecipes,          // ✅ SUDAH ADA
  getMySavedRecipes,     // ✅ SUDAH ADA
};