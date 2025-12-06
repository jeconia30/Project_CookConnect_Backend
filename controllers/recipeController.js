// controllers/recipeController.js
const recipeService = require('../services/recipeService');

const getRecipes = async (req, res) => {
  try {
    // req.query isinya bisa ?search=ayam atau ?sort=trending
    const recipes = await recipeService.getAllRecipes(req.query);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Ambil 1 Resep by ID
const getRecipeDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await recipeService.getRecipeById(id);
    
    if (!recipe) return res.status(404).json({ error: "Resep tidak ditemukan" });
    
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST: Upload Resep
const addRecipe = async (req, res) => {
  try {
    // Validasi sederhana
    if (!req.body.title || !req.body.user_id) {
      return res.status(400).json({ error: "Judul dan User ID wajib diisi" });
    }

    const newRecipe = await recipeService.createRecipe(req.body);
    res.status(201).json({ 
      message: "Resep berhasil diupload!", 
      data: newRecipe 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getRecipes, getRecipeDetail, addRecipe };