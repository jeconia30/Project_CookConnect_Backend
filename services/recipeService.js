// services/recipeService.js
const pool = require('../config/db');

// --- 1. GET ALL RECIPES (Bisa Search & Trending) ---
const getAllRecipes = async (queryParam) => {
  const { search, sort } = queryParam || {};
  
  let query = `
    SELECT recipes.*, users.username, users.avatar_url,
    (SELECT COUNT(*) FROM likes WHERE likes.recipe_id = recipes.id)::int as like_count,
    (SELECT COUNT(*) FROM comments WHERE comments.recipe_id = recipes.id)::int as comment_count
    FROM recipes 
    JOIN users ON recipes.user_id = users.id
  `;
  
  let params = [];
  
  // LOGIKA SEARCH (Judul)
  if (search) {
    query += ` WHERE recipes.title ILIKE $1`; 
    params.push(`%${search}%`);
  }

  // LOGIKA SORTING (Trending / Terbaru)
  if (sort === 'trending') {
    // Urutkan dari like terbanyak, lalu comment terbanyak
    query += ` ORDER BY like_count DESC, comment_count DESC LIMIT 5`;
  } else {
    // Default: Terbaru
    query += ` ORDER BY recipes.created_at DESC`;
  }

  const result = await pool.query(query, params);
  return result.rows;
};

// --- 2. UPLOAD RESEP KOMPLEKS (Transaction) ---
const createRecipe = async (data) => {
  const client = await pool.connect(); // Pakai client buat Transaction
  
  try {
    await client.query('BEGIN'); // Mulai

    const { 
      title, description, image_url, total_time, servings, difficulty, user_id,
      ingredients, steps // <-- Ini Array dari Frontend
    } = data;

    // A. Simpan Data Utama
    const recipeQuery = `
      INSERT INTO recipes (title, description, image_url, total_time, servings, difficulty, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const recipeRes = await client.query(recipeQuery, [title, description, image_url, total_time, servings, difficulty, user_id]);
    const newRecipe = recipeRes.rows[0];

    // B. Simpan Bahan-bahan (Looping)
    if (ingredients && ingredients.length > 0) {
      for (const item of ingredients) {
        // Pastikan item tidak kosong
        if(item.trim()) {
           await client.query(
            'INSERT INTO recipe_ingredients (recipe_id, item) VALUES ($1, $2)',
            [newRecipe.id, item]
          );
        }
      }
    }

    // C. Simpan Langkah-langkah (Looping)
    if (steps && steps.length > 0) {
      let stepNum = 1;
      for (const instruction of steps) {
        if(instruction.trim()) {
          await client.query(
            'INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES ($1, $2, $3)',
            [newRecipe.id, stepNum, instruction]
          );
          stepNum++;
        }
      }
    }

    await client.query('COMMIT'); // Simpan permanen
    return newRecipe;

  } catch (e) {
    await client.query('ROLLBACK'); // Batalkan semua kalau error
    throw e;
  } finally {
    client.release();
  }
};

// --- 3. GET DETAIL RESEP (Lengkap dengan Bahan & Langkah) ---
const getRecipeById = async (id) => {
  // Info Utama + Hitung Like/Komen
  const recipeQuery = `
    SELECT recipes.*, users.username, users.avatar_url,
    (SELECT COUNT(*) FROM likes WHERE likes.recipe_id = recipes.id)::int as like_count,
    (SELECT COUNT(*) FROM comments WHERE comments.recipe_id = recipes.id)::int as comment_count
    FROM recipes 
    JOIN users ON recipes.user_id = users.id
    WHERE recipes.id = $1
  `;
  const recipeRes = await pool.query(recipeQuery, [id]);
  
  if (recipeRes.rows.length === 0) return null;
  const recipe = recipeRes.rows[0];

  // Ambil Bahan
  const ingRes = await pool.query('SELECT item FROM recipe_ingredients WHERE recipe_id = $1 ORDER BY id ASC', [id]);
  recipe.ingredients = ingRes.rows.map(r => r.item); // Ubah jadi array string biasa

  // Ambil Langkah
  const stepRes = await pool.query('SELECT instruction FROM recipe_steps WHERE recipe_id = $1 ORDER BY step_number ASC', [id]);
  recipe.steps = stepRes.rows.map(r => r.instruction);

  return recipe;
};

module.exports = { getAllRecipes, createRecipe, getRecipeById };