const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/recipes -> Ambil semua resep (search, filter, sort)
router.get('/', recipeController.getRecipes);

// GET /api/recipes/search?q=ayam -> Search resep
router.get('/search', recipeController.searchRecipes);

// GET /api/recipes/:id -> Ambil detail resep
router.get('/:id', recipeController.getRecipeDetail);

// POST /api/recipes -> Upload resep baru (HARUS LOGIN)
router.post('/', authMiddleware, recipeController.addRecipe);

// POST /api/recipes/:id/like -> Like resep (HARUS LOGIN)
router.post('/:id/like', authMiddleware, recipeController.likeRecipe);

// POST /api/recipes/:id/unlike -> Unlike resep (HARUS LOGIN)
router.post('/:id/unlike', authMiddleware, recipeController.unlikeRecipe);

// POST /api/recipes/:id/save -> Save resep (HARUS LOGIN)
router.post('/:id/save', authMiddleware, recipeController.saveRecipe);

// POST /api/recipes/:id/unsave -> Unsave resep (HARUS LOGIN)
router.post('/:id/unsave', authMiddleware, recipeController.unsaveRecipe);

// GET /api/recipes/user/:userId -> Ambil resep user tertentu
router.get('/user/:userId', recipeController.getUserRecipes);

module.exports = router;
