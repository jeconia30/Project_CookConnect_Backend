// routes/recipeRoutes.js
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// GET /api/recipes -> Ambil semua
router.get('/', recipeController.getRecipes);

// GET /api/recipes/:id -> Ambil satu biji (Detail)
router.get('/:id', recipeController.getRecipeDetail);

// POST /api/recipes -> Upload baru
router.post('/', recipeController.addRecipe);

module.exports = router;