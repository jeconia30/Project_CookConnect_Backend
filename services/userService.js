const { supabase } = require('../config/supabaseClient');

const getUserProfile = async (username) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        full_name,
        bio,
        avatar_url,
        link_tiktok,
        link_instagram,
        recipes:recipes(count),
        followers:follows!following_id(count),
        following:follows!follower_id(count)
      `)
      .eq('username', username)
      .single();

    if (error) throw error;

    return {
      ...user,
      follower_count: user.followers?.[0]?.count || 0,
      following_count: user.following?.[0]?.count || 0,
      recipe_count: user.recipes?.[0]?.count || 0,
    };
  } catch (error) {
    throw error;
  }
};

const updateUserProfile = async (userId, updateData) => {
  try {
    const { data: updated, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return updated;
  } catch (error) {
    throw error;
  }
};

const getMyRecipes = async (userId) => {
  try {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        id,
        title,
        image_url,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return recipes;
  } catch (error) {
    throw error;
  }
};

const getMySavedRecipes = async (userId) => {
  try {
    const { data: savedRecipes, error } = await supabase
      .from('saves')
      .select(`
        recipes (
          id,
          title,
          image_url,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return savedRecipes.map(save => save.recipes);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getMyRecipes,
  getMySavedRecipes,
};