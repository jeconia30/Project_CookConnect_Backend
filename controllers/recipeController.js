const recipeService = require('../services/recipeService');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseFormatter');
const { validateCreateRecipeInput } = require('../utils/validator');

// GET /api/recipes -> Ambil semua resep (FIXED)
const getRecipes = async (req, res) => {
  try {
    const { search, sort } = req.query;
    const userId = req.user?.id || null;

    const recipes = await recipeService.getAllRecipes(
      { search, sort },
      userId
    );

    return successResponse(res, {
      count: recipes.length,
      recipes,
    }, 'Resep berhasil diambil');
  } catch (err) {
    console.error('Get Recipes Error:', err);
    return errorResponse(res, 'Gagal mengambil resep', 500);
  }
};

// GET /api/recipes/search?q=ayam -> Search resep (FIXED)
const searchRecipes = async (req, res) => {
  try {
    const { q } = req.query;

    // VALIDASI
    if (!q || q.trim() === '') {
      return errorResponse(res, 'Query pencarian tidak boleh kosong', 400);
    }

    // Cek panjang minimal
    if (q.trim().length < 2) {
      return errorResponse(res, 'Minimal 2 karakter untuk pencarian', 400);
    }

    const recipes = await recipeService.searchRecipes(q.trim());

    return successResponse(res, {
      query: q,
      count: recipes.length,
      recipes,
    }, 'Pencarian resep berhasil');
  } catch (err) {
    console.error('Search Recipes Error:', err);
    return errorResponse(res, 'Gagal mencari resep', 500);
  }
};

// GET /api/recipes/:id -> Ambil detail resep (FIXED)
const getRecipeDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    // VALIDASI
    if (!id || id.trim() === '') {
      return errorResponse(res, 'ID resep diperlukan', 400);
    }

    const recipe = await recipeService.getRecipeById(id, userId);

    if (!recipe) {
      return errorResponse(res, 'Resep tidak ditemukan', 404);
    }

    return successResponse(res, recipe, 'Detail resep berhasil diambil');
  } catch (err) {
    console.error('Get Recipe Detail Error:', err);
    return errorResponse(res, 'Gagal mengambil detail resep', 500);
  }
};

// POST /api/recipes -> Upload resep baru (FIXED)
const addRecipe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, image_url, total_time, servings, difficulty, ingredients, steps } = req.body;

    // VALIDASI INPUT
    const validationErrors = validateCreateRecipeInput({
      title,
      description,
      image_url,
      total_time,
      servings,
      difficulty,
      ingredients: ingredients || [],
      steps: steps || [],
    });

    if (validationErrors) {
      return validationErrorResponse(res, validationErrors);
    }

    const newRecipe = await recipeService.createRecipe({
      user_id: userId,
      title,
      description,
      image_url,
      total_time,
      servings,
      difficulty,
      ingredients,
      steps,
    });

    return successResponse(
      res,
      newRecipe,
      'Resep berhasil diterbitkan!',
      201
    );
  } catch (err) {
    console.error('Add Recipe Error:', err);
    return errorResponse(res, 'Gagal menerbitkan resep', 500);
  }
};

// POST /api/recipes/:id/like -> Like resep (FIXED)
const likeRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || id.trim() === '') {
      return errorResponse(res, 'ID resep diperlukan', 400);
    }

    const result = await recipeService.toggleLike(userId, id, true);

    return successResponse(res, result, 'Resep berhasil di-like');
  } catch (err) {
    console.error('Like Recipe Error:', err);
    return errorResponse(res, 'Gagal like resep', 500);
  }
};

// POST /api/recipes/:id/unlike -> Unlike resep (FIXED)
const unlikeRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || id.trim() === '') {
      return errorResponse(res, 'ID resep diperlukan', 400);
    }

    const result = await recipeService.toggleLike(userId, id, false);

    return successResponse(res, result, 'Resep berhasil di-unlike');
  } catch (err) {
    console.error('Unlike Recipe Error:', err);
    return errorResponse(res, 'Gagal unlike resep', 500);
  }
};

// POST /api/recipes/:id/save -> Save resep (FIXED)
const saveRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || id.trim() === '') {
      return errorResponse(res, 'ID resep diperlukan', 400);
    }

    const result = await recipeService.toggleSave(userId, id, true);

    return successResponse(res, result, 'Resep berhasil disimpan');
  } catch (err) {
    console.error('Save Recipe Error:', err);
    return errorResponse(res, 'Gagal menyimpan resep', 500);
  }
};

// POST /api/recipes/:id/unsave -> Unsave resep (FIXED)
const unsaveRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || id.trim() === '') {
      return errorResponse(res, 'ID resep diperlukan', 400);
    }

    const result = await recipeService.toggleSave(userId, id, false);

    return successResponse(res, result, 'Resep berhasil dihapus dari simpanan');
  } catch (err) {
    console.error('Unsave Recipe Error:', err);
    return errorResponse(res, 'Gagal menghapus simpanan resep', 500);
  }
};

// GET /api/recipes/user/:userId -> Ambil resep user tertentu (FIXED)
const getUserRecipes = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId.trim() === '') {
      return errorResponse(res, 'ID user diperlukan', 400);
    }

    const recipes = await recipeService.getRecipesByUserId(userId);

    return successResponse(res, {
      userId,
      count: recipes.length,
      recipes,
    }, 'Resep user berhasil diambil');
  } catch (err) {
    console.error('Get User Recipes Error:', err);
    return errorResponse(res, 'Gagal mengambil resep user', 500);
  }
};

module.exports = {
  getRecipes,
  searchRecipes,
  getRecipeDetail,
  addRecipe,
  likeRecipe,
  unlikeRecipe,
  saveRecipe,
  unsaveRecipe,
  getUserRecipes,
};