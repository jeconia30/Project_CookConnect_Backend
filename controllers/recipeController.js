const recipeService = require('../services/recipeService');

// GET /api/recipes
const getRecipes = async (req, res) => {
  try {
    const { search, sort } = req.query;
    const userId = req.headers.authorization ? 
      JSON.parse(Buffer.from(req.headers.authorization.split('.')[1], 'base64')).id 
      : null;

    const recipes = await recipeService.getAllRecipes(
      { search, sort },
      userId
    );

    res.json(recipes);
  } catch (err) {
    console.error('Get Recipes Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/recipes/search
const searchRecipes = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ 
        error: 'Query parameter "q" harus diisi',
        recipes: []
      });
    }

    const recipes = await recipeService.searchRecipes(q);
    res.json({ recipes });
  } catch (err) {
    console.error('Search Recipes Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/recipes/:id
const getRecipeDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    if (!id) {
      return res.status(400).json({ error: 'Recipe ID harus diisi' });
    }

    const recipe = await recipeService.getRecipeById(id, userId);

    if (!recipe) {
      return res.status(404).json({ error: 'Resep tidak ditemukan' });
    }

    res.json(recipe);
  } catch (err) {
    console.error('Get Recipe Detail Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/recipes
const addRecipe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, image_url, total_time, servings, difficulty, ingredients, steps } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ 
        error: 'Judul dan User ID wajib diisi',
        required: ['title', 'description', 'image_url', 'total_time', 'servings', 'difficulty', 'ingredients', 'steps']
      });
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

    res.status(201).json({
      message: 'Resep berhasil diupload!',
      data: newRecipe,
    });
  } catch (err) {
    console.error('Add Recipe Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/recipes/:id/like
const likeRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ error: 'Recipe ID harus diisi' });
    }

    const result = await recipeService.toggleLike(userId, id, true);
    res.json(result);
  } catch (err) {
    console.error('Like Recipe Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/recipes/:id/unlike
const unlikeRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ error: 'Recipe ID harus diisi' });
    }

    const result = await recipeService.toggleLike(userId, id, false);
    res.json(result);
  } catch (err) {
    console.error('Unlike Recipe Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/recipes/:id/save
const saveRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ error: 'Recipe ID harus diisi' });
    }

    const result = await recipeService.toggleSave(userId, id, true);
    res.json(result);
  } catch (err) {
    console.error('Save Recipe Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/recipes/:id/unsave
const unsaveRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ error: 'Recipe ID harus diisi' });
    }

    const result = await recipeService.toggleSave(userId, id, false);
    res.json(result);
  } catch (err) {
    console.error('Unsave Recipe Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/recipes/user/:userId
const getUserRecipes = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID harus diisi' });
    }

    const recipes = await recipeService.getRecipesByUserId(userId);
    res.json({
      count: recipes.length,
      recipes,
    });
  } catch (err) {
    console.error('Get User Recipes Error:', err);
    res.status(500).json({ error: err.message });
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
