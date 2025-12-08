const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/users -> Ambil semua users (dengan search)
router.get('/', userController.getUsers);

// GET /api/users/me -> Ambil profil user yang login
router.get('/me', authMiddleware, userController.getMyProfile);

// GET /api/users/:username -> Ambil profil user by username
router.get('/:username', userController.getUserProfile);

// ✅ BARU: Ambil resep user by username (Public)
router.get('/:username/recipes', userController.getUserRecipesByUsername);

// PUT /api/users/me/profile -> Update profil user (HARUS LOGIN)
router.put('/me/profile', authMiddleware, userController.updateProfile);

// DELETE /api/users/:id -> Hapus user (HARUS LOGIN)
router.delete('/:id', authMiddleware, userController.removeUser);

// POST /api/users/:username/follow -> Follow user (HARUS LOGIN)
router.post('/:username/follow', authMiddleware, userController.followUser);

// POST /api/users/:username/unfollow -> Unfollow user (HARUS LOGIN)
router.post('/:username/unfollow', authMiddleware, userController.unfollowUser);

// GET /api/users/me/recipes -> Ambil resep user yang login
router.get('/me/recipes', authMiddleware, userController.getMyRecipes);

// GET /api/users/me/saved-recipes -> Ambil resep saved user yang login
router.get('/me/saved-recipes', authMiddleware, userController.getMySavedRecipes);

module.exports = router;