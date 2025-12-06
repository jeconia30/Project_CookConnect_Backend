// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.put('/:id', userController.updateUserProfile);
router.delete('/:id', userController.removeUser);

module.exports = router;