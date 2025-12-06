const pool = require("../config/db");
const notifService = require("./notificationService");

// --- LIKE ---
const likeRecipe = async (userId, recipeId) => {
  // Cek dulu udah like belum?
  const check = await pool.query(
    "SELECT * FROM likes WHERE user_id = $1 AND recipe_id = $2",
    [userId, recipeId]
  );

  if (check.rows.length > 0) {
    // Kalau udah like, berarti UNLIKE (Hapus)
    await pool.query(
      "DELETE FROM likes WHERE user_id = $1 AND recipe_id = $2",
      [userId, recipeId]
    );
    return { status: "unliked" };
  } else {
    // Kalau belum, berarti LIKE (Insert)
    await pool.query("INSERT INTO likes (user_id, recipe_id) VALUES ($1, $2)", [
      userId,
      recipeId,
    ]);
    // --- TAMBAHAN NOTIF ---
    // Cari tau pemilik resep siapa?
    const recipe = await pool.query(
      "SELECT user_id, title FROM recipes WHERE id = $1",
      [recipeId]
    );
    const ownerId = recipe.rows[0].user_id;

    await notifService.createNotification(
      ownerId,
      userId,
      "like",
      `menyukai resep ${recipe.rows[0].title}`,
      recipeId
    );
    // ----------------------

    return { status: "liked" };
  }
};

// Hitung jumlah like di satu resep
const getLikeCount = async (recipeId) => {
  const result = await pool.query(
    "SELECT COUNT(*) FROM likes WHERE recipe_id = $1",
    [recipeId]
  );
  return result.rows[0].count;
};

// --- SAVE / BOOKMARK ---
const saveRecipe = async (userId, recipeId) => {
  // Logika sama: Toggle Save/Unsave
  const check = await pool.query(
    "SELECT * FROM saves WHERE user_id = $1 AND recipe_id = $2",
    [userId, recipeId]
  );

  if (check.rows.length > 0) {
    await pool.query(
      "DELETE FROM saves WHERE user_id = $1 AND recipe_id = $2",
      [userId, recipeId]
    );
    return { status: "unsaved" };
  } else {
    await pool.query("INSERT INTO saves (user_id, recipe_id) VALUES ($1, $2)", [
      userId,
      recipeId,
    ]);
    return { status: "saved" };
  }
};

module.exports = { likeRecipe, getLikeCount, saveRecipe };
