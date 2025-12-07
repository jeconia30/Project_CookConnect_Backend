const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ TAMBAHKAN AUTH

// POST /api/comments -> Kirim komentar (HARUS LOGIN)
router.post('/', authMiddleware, commentController.postComment);

// GET /api/comments/recipe/:recipeId -> Lihat komentar resep
router.get('/recipe/:recipeId', commentController.getComments);

// DELETE /api/comments/:id -> Hapus komentar (HARUS LOGIN & OWNERSHIP)
router.delete('/:id', authMiddleware, commentController.removeComment);

module.exports = router;