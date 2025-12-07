const commentService = require('../services/commentService');

// POST /api/comments
const postComment = async (req, res) => {
  try {
    // ✅ PERBAIKAN: Ambil user_id dari token yang sudah di-decode middleware
    const userId = req.user.id;
    const { recipe_id, content } = req.body;

    // Validasi input
    if (!recipe_id || !content) {
      return res.status(400).json({
        error: 'recipe_id dan content harus diisi',
      });
    }

    // Panggil service dengan data lengkap
    const comment = await commentService.addComment({
      recipe_id,
      user_id: userId,
      content,
    });

    res.status(201).json({
      message: 'Komentar berhasil dikirim',
      data: comment,
    });
  } catch (err) {
    console.error('Post Comment Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/comments/recipe/:recipeId
const getComments = async (req, res) => {
  try {
    const { recipeId } = req.params;

    if (!recipeId) {
      return res.status(400).json({ error: 'recipeId harus diisi' });
    }

    const comments = await commentService.getCommentsByRecipe(recipeId);
    res.json({
      count: comments.length,
      comments,
    });
  } catch (err) {
    console.error('Get Comments Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/comments/:id
const removeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Dari middleware auth

    if (!id) {
      return res.status(400).json({ error: 'Comment ID harus diisi' });
    }

    await commentService.deleteComment(id, userId);
    res.json({ message: 'Komentar berhasil dihapus' });
  } catch (err) {
    console.error('Delete Comment Error:', err);
    
    // Handle specific error messages
    if (err.message.includes('tidak berhak')) {
      return res.status(403).json({ error: err.message });
    }
    
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  postComment,
  getComments,
  removeComment,
};