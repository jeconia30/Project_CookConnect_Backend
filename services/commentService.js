const pool = require('../config/db');

// Tambah Komentar
const addComment = async (data) => {
  const { recipe_id, user_id, content } = data;
  const query = `
    INSERT INTO comments (recipe_id, user_id, content)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const result = await pool.query(query, [recipe_id, user_id, content]);
  return result.rows[0];
};

// Ambil Komentar berdasarkan Resep (Join User biar ada namanya)
const getCommentsByRecipe = async (recipeId) => {
  const query = `
    SELECT comments.*, users.username, users.avatar_url 
    FROM comments
    JOIN users ON comments.user_id = users.id
    WHERE recipe_id = $1
    ORDER BY created_at ASC
  `;
  const result = await pool.query(query, [recipeId]);
  return result.rows;
};

// Hapus Komentar
const deleteComment = async (id) => {
  const query = 'DELETE FROM comments WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = { addComment, getCommentsByRecipe, deleteComment };