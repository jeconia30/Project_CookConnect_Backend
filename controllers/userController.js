// controllers/userController.js
const userService = require('../services/userService');

const getUsers = async (req, res) => {
  try {
    const { search } = req.query; // Ambil search dari URL
    const users = await userService.getAllUsers(search);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userService.updateUser(id, req.body);
    
    if (!updatedUser) return res.status(440).json({ error: "User tidak ditemukan" });
    
    res.json({ message: "Profil update!", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await userService.deleteUser(id);

    if (!deletedUser) return res.status(404).json({ error: "User tidak ditemukan" });

    res.json({ message: "Akun dihapus!", user: deletedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getUsers, updateUserProfile, removeUser };