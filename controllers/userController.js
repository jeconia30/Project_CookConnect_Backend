const userService = require('../services/userService');
const notifService = require('../services/notificationService');
const { supabaseAdmin, supabase } = require('../config/supabaseClient'); 
const jwt = require('jsonwebtoken');

// GET /api/users
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const users = await userService.getAllUsers(search);
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/me
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userService.getUserById(userId);
    res.json({ profile: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/users/:username
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: 'Username harus diisi' });

    const user = await userService.getUserProfile(username);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    let isFollowing = false;
    const authHeader = req.headers.authorization;

    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        if (token && token !== 'null') {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const currentUserId = decoded.id;

            console.log(`[DEBUG CHECK FOLLOW] CurrentUser: ${currentUserId} vs TargetUser: ${user.id}`);

            if (currentUserId !== user.id) {
              const { data, error } = await supabaseAdmin
                .from('follows')
                .select('*')
                .eq('follower_id', currentUserId)
                .eq('following_id', user.id)
                .maybeSingle();

              if (error) console.error('[DEBUG CHECK FOLLOW] Error DB:', error.message);
              console.log('[DEBUG CHECK FOLLOW] Data ditemukan:', data);

              if (data) {
                isFollowing = true;
              }
            }
        }
      } catch (err) {
        console.log('Token check error:', err.message);
      }
    }

    res.json({
      profile: {
        ...user,
        is_following: isFollowing 
      }
    });

  } catch (err) {
    console.error('Get User Profile Error:', err);
    res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.user.id, req.body);
    res.json({ message: 'Profil diperbarui', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeUser = async (req, res) => {
  try {
    if (req.params.id !== req.user.id) return res.status(403).json({ error: 'Dilarang' });
    await userService.deleteUser(req.params.id);
    res.json({ message: 'Akun dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const followUser = async (req, res) => {
  try {
    const { username } = req.params;
    const followerId = req.user.id;

    console.log(`[Follow] ${followerId} ingin follow ${username}`);

    const { data: targetUser, error: findError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (findError || !targetUser) {
      return res.status(404).json({ error: 'User target tidak ditemukan' });
    }
    
    const followingId = targetUser.id;
    if (followerId === followingId) return res.status(400).json({ error: 'Tidak bisa follow diri sendiri' });

    // ✅ PERBAIKAN: Ganti .select('id') jadi .select('*')
    const { data: existing } = await supabaseAdmin
      .from('follows')
      .select('*') 
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    
    if (existing) {
        return res.status(200).json({ message: 'Sudah mengikuti' }); 
    }

    const { error: insertError } = await supabaseAdmin
      .from('follows')
      .insert([{ follower_id: followerId, following_id: followingId }]);

    if (insertError) throw insertError;

    try {
      await notifService.createNotification(followingId, followerId, 'follow', 'mulai mengikuti Anda');
    } catch(e) { console.log('Notif error:', e.message); }

    res.json({ message: 'Berhasil mengikuti' });
  } catch (err) {
    console.error('[Follow Error]:', err);
    res.status(500).json({ error: err.message });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { username } = req.params;
    const followerId = req.user.id;

    const { data: targetUser } = await supabaseAdmin.from('users').select('id').eq('username', username).single();
    if (!targetUser) return res.status(404).json({ error: 'User tidak ditemukan' });

    const { error } = await supabaseAdmin
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', targetUser.id);

    if (error) throw error;

    res.json({ message: 'Berhasil berhenti mengikuti' });
  } catch (err) {
    console.error('[Unfollow Error]:', err);
    res.status(500).json({ error: err.message });
  }
};

const getMyRecipes = async (req, res) => {
  try {
    const recipes = await userService.getMyRecipes(req.user.id);
    res.json({ count: recipes.length, recipes });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getMySavedRecipes = async (req, res) => {
  try {
    const recipes = await userService.getMySavedRecipes(req.user.id);
    res.json({ count: recipes.length, recipes });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getUserRecipesByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userService.getUserProfile(username);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    const recipes = await userService.getMyRecipes(user.id);
    res.json({ count: recipes.length, recipes });
  } catch (err) {
    console.error('Get User Recipes Error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers, getMyProfile, getUserProfile, updateProfile, removeUser,
  followUser, unfollowUser, getMyRecipes, getMySavedRecipes, getUserRecipesByUsername
};