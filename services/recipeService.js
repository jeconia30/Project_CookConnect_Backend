const { supabase, supabaseAdmin } = require('../config/supabaseClient');

const getAllRecipes = async (queryParam) => {
  const { search, sort } = queryParam || {};

  try {
    let query = supabase
      .from('recipes')
      .select(`
        id,
        title,
        description,
        image_url,
        total_time,
        servings,
        difficulty,
        created_at,
        users:user_id (username, avatar_url),
        likes:likes(count),
        comments:comments(count)
      `);

    // Filter search
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sorting
    if (sort === 'trending') {
      query = query.order('likes', { count: 'desc' }).limit(5);
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;

    // Format response
    return data.map(recipe => ({
      ...recipe,
      author: recipe.users?.username || 'Anonymous',
      avatar_url: recipe.users?.avatar_url,
      like_count: recipe.likes?.[0]?.count || 0,
      comment_count: recipe.comments?.[0]?.count || 0,
    }));
  } catch (error) {
    throw error;
  }
};

const getRecipeById = async (id, userId = null) => {
  try {
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select(`
        *,
        users:user_id (id, username, avatar_url, bio),
        recipe_ingredients (item),
        recipe_steps (step_number, instruction),
        likes:likes(count),
        comments:comments(count)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Cek apakah user sudah like/save (jika login)
    let isLiked = false;
    let isSaved = false;

    if (userId) {
      const { data: likeCheck } = await supabase
        .from('likes')
        .select('id')
        .eq('recipe_id', id)
        .eq('user_id', userId)
        .single();

      const { data: saveCheck } = await supabase
        .from('saves')
        .select('id')
        .eq('recipe_id', id)
        .eq('user_id', userId)
        .single();

      isLiked = !!likeCheck;
      isSaved = !!saveCheck;
    }

    return {
      ...recipe,
      author: recipe.users?.username,
      user_fullname: recipe.users?.username,
      avatar_url: recipe.users?.avatar_url,
      bio: recipe.users?.bio,
      ingredients: recipe.recipe_ingredients.map(r => r.item),
      steps: recipe.recipe_steps
        .sort((a, b) => a.step_number - b.step_number)
        .map(r => r.instruction),
      like_count: recipe.likes?.[0]?.count || 0,
      comment_count: recipe.comments?.[0]?.count || 0,
      is_liked: isLiked,
      is_saved: isSaved,
    };
  } catch (error) {
    throw error;
  }
};

const createRecipe = async (data, userId) => {
  const {
    title,
    description,
    image_url,
    total_time,
    servings,
    difficulty,
    ingredients,
    steps,
  } = data;

  try {
    // 1. Insert recipe utama
    const { data: newRecipe, error: recipeError } = await supabase
      .from('recipes')
      .insert([
        {
          user_id: userId,
          title,
          description,
          image_url,
          total_time: parseInt(total_time),
          servings: parseInt(servings),
          difficulty,
        },
      ])
      .select()
      .single();

    if (recipeError) throw recipeError;

    // 2. Insert ingredients
    if (ingredients && ingredients.length > 0) {
      const ingredientRecords = ingredients
        .filter(item => item.trim())
        .map(item => ({
          recipe_id: newRecipe.id,
          item,
        }));

      const { error: ingError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientRecords);

      if (ingError) throw ingError;
    }

    // 3. Insert steps
    if (steps && steps.length > 0) {
      const stepRecords = steps
        .filter(step => step.trim())
        .map((step, index) => ({
          recipe_id: newRecipe.id,
          step_number: index + 1,
          instruction: step,
        }));

      const { error: stepError } = await supabase
        .from('recipe_steps')
        .insert(stepRecords);

      if (stepError) throw stepError;
    }

    return newRecipe;
  } catch (error) {
    throw error;
  }
};

module.exports = { getAllRecipes, getRecipeById, createRecipe };