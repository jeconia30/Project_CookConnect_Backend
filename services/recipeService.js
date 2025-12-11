const { supabase, supabaseAdmin } = require("../config/supabaseClient"); // ✅ PASTIKAN ADA supabaseAdmin
const notifService = require("./notificationService");

// Ambil semua resep dengan filter dan sort
const getAllRecipes = async (queryParam = {}, userId = null) => {
  const { search, sort } = queryParam;

  try {
    let query = supabase.from("recipes").select(`
        id,
        title,
        description,
        image_url,
        total_time,
        servings,
        difficulty,
        created_at,
        user_id,
        users:user_id (id, username, avatar_url, full_name),
        recipe_steps (step_number, instruction),
        likes:likes(count),
        comments:comments(count),
        saves:saves(count)
      `);

    if (search && search.trim() !== "") {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (sort !== "trending") {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query.limit(50);
    if (error) throw error;

    // --- CEK STATUS USER (Like, Save, Follow) ---
    let likedRecipeIds = [];
    let savedRecipeIds = [];
    let followedUserIds = [];

    if (userId) {
      // 1. Cek Like
      const { data: userLikes } = await supabase
        .from("likes")
        .select("recipe_id")
        .eq("user_id", userId);
      if (userLikes) likedRecipeIds = userLikes.map((i) => i.recipe_id);

      // 2. Cek Save
      const { data: userSaves } = await supabase
        .from("saves")
        .select("recipe_id")
        .eq("user_id", userId);
      if (userSaves) savedRecipeIds = userSaves.map((i) => i.recipe_id);

      // 3. Cek Follow (Gunakan supabaseAdmin agar aman dari RLS)
      const { data: userFollows } = await supabaseAdmin
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);
      if (userFollows) followedUserIds = userFollows.map((f) => f.following_id);
    }

    let formattedData = (data || []).map((recipe) => {
      const likes = recipe.likes?.[0]?.count || 0;

      return {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        image_url: recipe.image_url,
        image: recipe.image_url,
        total_time: recipe.total_time,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        created_at: recipe.created_at,
        author: recipe.users?.full_name || recipe.users?.username || "Pengguna",
        handle: recipe.users?.username || "user",
        user_id: recipe.user_id,
        avatar_url: recipe.users?.avatar_url,
        avatar: recipe.users?.avatar_url,
        steps: recipe.recipe_steps
          ? recipe.recipe_steps
              .sort((a, b) => a.step_number - b.step_number)
              .map((s) => s.instruction)
          : [],
        like_count: likes,
        likes,
        comment_count: recipe.comments?.[0]?.count || 0,
        comments: recipe.comments?.[0]?.count || 0,
        saves: recipe.saves?.[0]?.count || 0,
        is_liked: likedRecipeIds.includes(recipe.id),
        is_saved: savedRecipeIds.includes(recipe.id),
        is_following: followedUserIds.includes(recipe.user_id),
      };
    });

    if (sort === "trending") {
      formattedData.sort((a, b) => b.likes - a.likes);
    }

    return formattedData;
  } catch (error) {
    throw error;
  }
};

const searchRecipes = async (query) => {
  try {
    const { data, error } = await supabase
      .from("recipes")
      .select(
        `
        id,
        title,
        description,
        image_url,
        total_time,
        servings,
        difficulty,
        created_at,
        user_id,
        users:user_id (id, username, avatar_url, full_name),
        likes:likes(count),
        comments:comments(count)
      `
      )
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) throw error;

    return (data || []).map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image_url: recipe.image_url,
      image: recipe.image_url,
      total_time: recipe.total_time,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      author: recipe.users?.username,
      handle: recipe.users?.username,
      avatar_url: recipe.users?.avatar_url,
      avatar: recipe.users?.avatar_url,
      like_count: recipe.likes?.[0]?.count || 0,
      comment_count: recipe.comments?.[0]?.count || 0,
    }));
  } catch (error) {
    throw error;
  }
};

// services/recipeService.js

const getRecipeById = async (id, userId = null) => {
  try {
    const { data: recipe, error } = await supabase
      .from("recipes")
      .select(
        `
        *,
        users:user_id (id, username, avatar_url, bio, full_name),
        recipe_ingredients (item),
        recipe_steps (step_number, instruction),
        likes:likes(count),
        comments:comments(count),
        saves:saves(count)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    // Default status
    let isLiked = false;
    let isSaved = false;
    let isFollowing = false; // ✅ 1. Siapkan variabel ini

    if (userId) {
      // 1. Cek Like
      const { data: likeCheck } = await supabase
        .from("likes")
        .select("id")
        .eq("recipe_id", id)
        .eq("user_id", userId)
        .maybeSingle();
      isLiked = !!likeCheck;

      // 2. Cek Save
      const { data: saveCheck } = await supabase
        .from("saves")
        .select("id")
        .eq("recipe_id", id)
        .eq("user_id", userId)
        .maybeSingle();
      isSaved = !!saveCheck;

      // ✅ 3. Cek Follow (TAMBAHAN YANG HILANG)
      // Cek apakah 'userId' (saya) ada hubungan follow dengan 'recipe.user_id' (penulis)
      const { data: followCheck } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", userId)
        .eq("following_id", recipe.user_id)
        .maybeSingle();

      isFollowing = !!followCheck; // Kalau ketemu data, berarti true
    }

    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image_url: recipe.image_url,
      image: recipe.image_url,
      total_time: recipe.total_time,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      created_at: recipe.created_at,
      author: recipe.users?.username,
      user_fullname: recipe.users?.full_name,
      avatar_url: recipe.users?.avatar_url,
      avatar: recipe.users?.avatar_url,
      bio: recipe.users?.bio,
      ingredients: recipe.recipe_ingredients?.map((r) => r.item) || [],
      steps:
        recipe.recipe_steps
          ?.sort((a, b) => a.step_number - b.step_number)
          .map((r) => r.instruction) || [],
      like_count: recipe.likes?.[0]?.count || 0,
      comment_count: recipe.comments?.[0]?.count || 0,

      // ✅ 4. Jangan lupa kembalikan statusnya ke Frontend
      is_liked: isLiked,
      is_saved: isSaved,
      is_following: isFollowing,

      video_url: recipe.video_url,
      tiktok_url: recipe.tiktok_url,
      instagram_url: recipe.instagram_url,
    };
  } catch (error) {
    throw error;
  }
};

const createRecipe = async (data) => {
  const {
    user_id,
    title,
    description,
    image_url,
    total_time,
    servings,
    difficulty,
    ingredients,
    steps,
    video_url,
    tiktok_url,
    instagram_url,
  } = data;

  try {
    const { data: newRecipe, error: recipeError } = await supabase
      .from("recipes")
      .insert([
        {
          user_id,
          title,
          description,
          image_url,
          total_time: parseInt(total_time) || 0,
          servings: parseInt(servings) || 0,
          difficulty,
          video_url,
          tiktok_url,
          instagram_url,
        },
      ])
      .select()
      .single();

    if (recipeError) throw recipeError;

    if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
      const ingredientRecords = ingredients
        .filter((item) => item && item.trim())
        .map((item) => ({
          recipe_id: newRecipe.id,
          item: item.trim(),
        }));

      if (ingredientRecords.length > 0) {
        const { error: ingError } = await supabase
          .from("recipe_ingredients")
          .insert(ingredientRecords);

        if (ingError) throw ingError;
      }
    }

    if (steps && Array.isArray(steps) && steps.length > 0) {
      const stepRecords = steps
        .filter((step) => step && step.trim())
        .map((step, index) => ({
          recipe_id: newRecipe.id,
          step_number: index + 1,
          instruction: step.trim(),
        }));

      if (stepRecords.length > 0) {
        const { error: stepError } = await supabase
          .from("recipe_steps")
          .insert(stepRecords);

        if (stepError) throw stepError;
      }
    }

    return newRecipe;
  } catch (error) {
    throw error;
  }
};

const toggleLike = async (userId, recipeId, shouldLike) => {
  try {
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("recipe_id", recipeId)
      .eq("user_id", userId)
      .maybeSingle();

    if (shouldLike && !existingLike) {
      await supabase
        .from("likes")
        .insert([{ recipe_id: recipeId, user_id: userId }]);

      try {
        const { data: recipe } = await supabase
          .from("recipes")
          .select("user_id, title")
          .eq("id", recipeId)
          .single();

        if (recipe && recipe.user_id !== userId) {
          await notifService.createNotification(
            recipe.user_id,
            userId,
            "like",
            `menyukai resep "${recipe.title}"`,
            recipeId
          );
        }
      } catch (notifError) {
        console.log("Notifikasi gagal (non-critical):", notifError.message);
      }

      return { status: "liked" };
    } else if (!shouldLike && existingLike) {
      await supabase
        .from("likes")
        .delete()
        .eq("recipe_id", recipeId)
        .eq("user_id", userId);

      return { status: "unliked" };
    }

    return { status: existingLike ? "liked" : "unliked" };
  } catch (error) {
    throw error;
  }
};

const toggleSave = async (userId, recipeId, shouldSave) => {
  try {
    const { data: existingSave } = await supabase
      .from("saves")
      .select("id")
      .eq("recipe_id", recipeId)
      .eq("user_id", userId)
      .maybeSingle();

    if (shouldSave && !existingSave) {
      await supabase
        .from("saves")
        .insert([{ recipe_id: recipeId, user_id: userId }]);

      return { status: "saved" };
    } else if (!shouldSave && existingSave) {
      await supabase
        .from("saves")
        .delete()
        .eq("recipe_id", recipeId)
        .eq("user_id", userId);

      return { status: "unsaved" };
    }

    return { status: existingSave ? "saved" : "unsaved" };
  } catch (error) {
    throw error;
  }
};

const getRecipesByUserId = async (userId) => {
  try {
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select(
        `
        id,
        title,
        image_url,
        created_at,
        likes:likes(count)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (recipes || []).map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image_url: recipe.image_url,
      image: recipe.image_url,
      created_at: recipe.created_at,
      likes: recipe.likes?.[0]?.count || 0,
    }));
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllRecipes,
  searchRecipes,
  getRecipeById,
  createRecipe,
  toggleLike,
  toggleSave,
  getRecipesByUserId,
};
