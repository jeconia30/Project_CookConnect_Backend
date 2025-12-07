const userService = require('../services/userService');
const recipeService = require('../services/recipeService');

// GET /api/users
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const users = await userService.getAllUsers(search);
    res.json({
      count: users.length,
      users,
    });
  } catch (err) {
    console.error('Get Users Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/me
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: user, error } = require('../config/supabaseClient').supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({ profile: user });
  } catch (err) {
    console.error('Get My Profile Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/:username
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: 'Username harus diisi' });
    }

    const user = await userService.getUserProfile(username);

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json({ profile: user });
  } catch (err) {
    console.error('Get User Profile Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/users/me/profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedUser = await userService.updateUser(userId, req.body);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json({
      message: 'Profil berhasil diperbarui!',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/users/:id
const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    const authUserId = req.user.id;

    // Pastikan user hanya bisa hapus akun mereka sendiri
    if (id !== authUserId) {
      return res.status(403).json({ 
        error: 'Anda tidak berhak menghapus akun user lain' 
      });
    }

    const deletedUser = await userService.deleteUser(id);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json({
      message: 'Akun berhasil dihapus!',
      user: deletedUser,
    });
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users/:username/follow
const followUser = async (req, res) => {
  try {
    const { username } = req.params;
    const followerId = req.user.id;

    if (!username) {
      return res.status(400).json({ error: 'Username harus diisi' });
    }

    // Ambil ID user yang akan di-follow
    const { data: userToFollow, error: userError } = require('../config/supabaseClient').supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !userToFollow) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const followingId = userToFollow.id;

    // Cek apakah sudah follow
    const { data: existingFollow } = require('../config/supabaseClient').supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (existingFollow) {
      return res.status(400).json({ error: 'Anda sudah mengikuti user ini' });
    }

    // Tambah follow
    await require('../config/supabaseClient').supabase
      .from('follows')
      .insert([{
        follower_id: followerId,
        following_id: followingId,
      }]);

    res.json({ message: 'Berhasil mengikuti user' });
  } catch (err) {
    console.error('Follow User Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/users/:username/unfollow
const unfollowUser = async (req, res) => {
  try {
    const { username } = req.params;
    const followerId = req.user.id;

    if (!username) {
      return res.status(400).json({ error: 'Username harus diisi' });
    }

    // Ambil ID user yang akan di-unfollow
    const { data: userToUnfollow, error: userError } = require('../config/supabaseClient').supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !userToUnfollow) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const followingId = userToUnfollow.id;

    // Hapus follow
    await require('../config/supabaseClient').supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    res.json({ message: 'Berhasil berhenti mengikuti user' });
  } catch (err) {
    console.error('Unfollow User Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/me/recipes
const getMyRecipes = async (req, res) => {
  try {
    const userId = req.user.id;
    const recipes = await userService.getMyRecipes(userId);

    res.json({
      count: recipes.length,
      recipes,
    });
  } catch (err) {
    console.error('Get My Recipes Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/me/saved-recipes
const getMySavedRecipes = async (req, res) => {
  try {
    const userId = req.user.id;
    const recipes = await userService.getMySavedRecipes(userId);

    res.json({
      count: recipes.length,
      recipes,
    });
  } catch (err) {
    console.error('Get My Saved Recipes Error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  getMyProfile,
  getUserProfile,
  updateProfile,
  removeUser,
  followUser,
  unfollowUser,
  getMyRecipes,
  getMySavedRecipes,
};