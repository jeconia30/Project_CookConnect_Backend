const { supabase } = require('../config/supabaseClient');
const notifService = require('./notificationService');

const addComment = async (recipeId, userId, content) => {
  try {
    const { data: newComment, error } = await supabase
      .from('comments')
      .insert([
        {
          recipe_id: recipeId,
          user_id: userId,
          content,
        },
      ])
      .select()
      .single();

    if (error) throw error;

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
        'comment',
        `mengomentari resep ${recipe.title}`,
        recipeId
      );
    }

    return newComment;
  } catch (error) {
    throw error;
  }
};

const getCommentsByRecipe = async (recipeId) => {
  try {
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        users:user_id (username, avatar_url)
      `)
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return comments.map(comment => ({
      id: comment.id,
      text: comment.content,
      time: new Date(comment.created_at).toLocaleString('id-ID'),
      username: comment.users?.username,
      avatar: comment.users?.avatar_url,
      name: comment.users?.username,
    }));
  } catch (error) {
    throw error;
  }
};

const deleteComment = async (commentId, userId) => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;

    return { message: 'Komentar dihapus' };
  } catch (error) {
    throw error;
  }
};

module.exports = { addComment, getCommentsByRecipe, deleteComment };