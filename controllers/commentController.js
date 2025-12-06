const commentService = require('../services/commentService');

const postComment = async (req, res) => {
  try {
    const comment = await commentService.addComment(req.body);
    res.status(201).json({ message: "Komentar terkirim", data: comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { recipeId } = req.params; // Ambil dari URL
    const comments = await commentService.getCommentsByRecipe(recipeId);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeComment = async (req, res) => {
  try {
    const { id } = req.params;
    await commentService.deleteComment(id);
    res.json({ message: "Komentar dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { postComment, getComments, removeComment };