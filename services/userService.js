// ✅ PENTING: Ganti import menjadi supabaseAdmin
const { supabaseAdmin } = require('../config/supabaseClient');

// Helper: Hitung Followers & Following (Pakai Admin agar tidak kena RLS)
const getUserCounts = async (userId) => {
  console.log(`[DEBUG] Menghitung counts untuk UserID: ${userId}`);

  // Hitung Followers
  const resFollowers = await supabaseAdmin
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId);

  console.log(`[DEBUG] Hasil Followers: Count=${resFollowers.count}, Error=${resFollowers.error?.message}`);

  // Hitung Following
  const resFollowing = await supabaseAdmin
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId);

  console.log(`[DEBUG] Hasil Following: Count=${resFollowing.count}, Error=${resFollowing.error?.message}`);

  return { 
    followersCount: resFollowers.count || 0, 
    followingCount: resFollowing.count || 0 
  };
};

const getUserProfile = async (username) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle(); // ✅ GANTI single() JADI maybeSingle()

    if (error) throw error;
    if (!user) return null; // Handle jika user tidak ditemukan

    const counts = await getUserCounts(user.id);

    return {
      ...user,
      followers_count: counts.followersCount,
      following_count: counts.followingCount
    };
  } catch (error) {
    throw error;
  }
};

// 2. Ambil profil by ID
const getUserById = async (userId) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // ✅ GANTI single() JADI maybeSingle()

    if (error) throw error;
    if (!user) return null;

    const counts = await getUserCounts(user.id);

    return {
      ...user,
      followers_count: counts.followersCount,
      following_count: counts.followingCount
    };
  } catch (error) {
    throw error;
  }
};

// ... Fungsi CRUD Lainnya (Pakai Admin juga biar konsisten & aman dari RLS) ...

const getAllUsers = async (search = null) => {
  try {
    let query = supabaseAdmin.from('users').select('id, username, full_name, bio, avatar_url');
    if (search && search.trim() !== '') {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
    }
    const { data, error } = await query.limit(20);
    if (error) throw error;
    return data || [];
  } catch (error) { throw error; }
};

const updateUser = async (userId, updateData) => {
  try {
    const { data, error } = await supabaseAdmin.from('users').update(updateData).eq('id', userId).select().single();
    if (error) throw error;
    return data;
  } catch (error) { throw error; }
};

const deleteUser = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin.from('users').delete().eq('id', userId).select().single();
    if (error) throw error;
    return data;
  } catch (error) { throw error; }
};

const getMyRecipes = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin.from('recipes').select('id, title, image_url, created_at').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) { throw error; }
};

const getMySavedRecipes = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin.from('saves').select('recipe_id, recipes(id, title, image_url, created_at)').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(save => save.recipes).filter(Boolean);
  } catch (error) { throw error; }
};

module.exports = {
  getAllUsers,
  getUserProfile,
  getUserById,
  updateUser,
  deleteUser,
  getMyRecipes,
  getMySavedRecipes,
};