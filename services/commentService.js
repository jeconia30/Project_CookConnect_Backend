const { supabase } = require('../config/supabaseClient');
const notifService = require('./notificationService');

// ✅ PERBAIKAN: Sesuaikan dengan commentController.postComment
const addComment = async (commentData) => {
  try {
    // Extract dari request body
    const { recipe_id, user_id, content } = commentData;

    // Validasi input
    if (!recipe_id || !user_id || !content) {
      throw new Error('recipe_id, user_id, dan content harus diisi');
    }

    // Insert komentar baru
    const { data: newComment, error } = await supabase
      .from('comments')
      .insert([
        {
          recipe_id,
          user_id,
          content,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // ✅ BUAT NOTIFIKASI (jika bukan user sendiri)
    try {
      const { data: recipe } = await supabase
        .from('recipes')
        .select('user_id, title')
        .eq('id', recipe_id)
        .single();

      if (recipe && recipe.user_id !== user_id) {
        await notifService.createNotification(
          recipe.user_id,
          user_id,
          'comment',
          `mengomentari resep "${recipe.title}"`,
          recipe_id
        );
      }
    } catch (notifError) {
      console.log('Notifikasi gagal (non-critical):', notifError.message);
      // Jangan throw error, komentar tetap tersimpan
    }

    return newComment;
  } catch (error) {
    throw error;
  }
};

// ✅ PERBAIKAN: Ambil komentar by recipe ID
const getCommentsByRecipe = async (recipeId) => {
  try {
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        users:user_id (
          username,
          avatar_url,
          full_name
        )
      `)
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format response
    return (comments || []).map(comment => ({
      id: comment.id,
      text: comment.content,
      time: new Date(comment.created_at).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      username: comment.users?.username || 'Anonymous',
      name: comment.users?.full_name || 'Anonymous',
      avatar: comment.users?.avatar_url,
    }));
  } catch (error) {
    throw error;
  }
};

// ✅ PERBAIKAN: Hapus komentar dengan validasi user
const deleteComment = async (commentId, userId) => {
  try {
    // Cek apakah komentar milik user ini
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (fetchError) throw new Error('Komentar tidak ditemukan');

    // Validasi ownership
    if (comment.user_id !== userId) {
      throw new Error('Anda tidak berhak menghapus komentar ini');
    }

    // Hapus komentar
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) throw deleteError;

    return { message: 'Komentar berhasil dihapus' };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  addComment,              // ✅ PERBAIKAN
  getCommentsByRecipe,     // ✅ PERBAIKAN
  deleteComment,           // ✅ PERBAIKAN
};