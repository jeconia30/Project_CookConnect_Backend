const interactionService = require('../services/interactionService');

const toggleLike = async (req, res) => {
  try {
    const { user_id, recipe_id } = req.body;
    const result = await interactionService.likeRecipe(user_id, recipe_id);
    res.json(result); // Balasannya: { status: 'liked' } atau { status: 'unliked' }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleSave = async (req, res) => {
  try {
    const { user_id, recipe_id } = req.body;
    const result = await interactionService.saveRecipe(user_id, recipe_id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { toggleLike, toggleSave };
