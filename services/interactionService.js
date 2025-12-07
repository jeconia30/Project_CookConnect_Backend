const { supabase } = require('../config/supabaseClient');
const notifService = require('./notificationService');

const toggleLike = async (userId, recipeId) => {
  try {
    // Cek sudah like?
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Hapus like
      await supabase
        .from('likes')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('user_id', userId);

      return { status: 'unliked' };
    } else {
      // Tambah like
      await supabase
        .from('likes')
        .insert([{ recipe_id: recipeId, user_id: userId }]);

      // Buat notifikasi
      const { data: recipe } = await supabase
        .from('recipes')
        .select('user_id, title')
        .eq('id', recipeId)
        .single();

      if (recipe.user_id !== userId) {
        await notifService.createNotification(
          recipe.user_id,
          userId,
          'like',
          `menyukai resep ${recipe.title}`,
          recipeId
        );
      }

      return { status: 'liked' };
    }
  } catch (error) {
    throw error;
  }
};

const toggleSave = async (userId, recipeId) => {
  try {
    const { data: existingSave } = await supabase
      .from('saves')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (existingSave) {
      await supabase
        .from('saves')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('user_id', userId);

      return { status: 'unsaved' };
    } else {
      await supabase
        .from('saves')
        .insert([{ recipe_id: recipeId, user_id: userId }]);

      return { status: 'saved' };
    }
  } catch (error) {
    throw error;
  }
};

module.exports = { toggleLike, toggleSave };