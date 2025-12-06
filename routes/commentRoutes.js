const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// POST /api/comments -> Kirim komen
router.post('/', commentController.postComment);

// GET /api/comments/recipe/:recipeId -> Lihat komen di resep tertentu
router.get('/recipe/:recipeId', commentController.getComments);

// DELETE /api/comments/:id -> Hapus komen
router.delete('/:id', commentController.removeComment);

module.exports = router;