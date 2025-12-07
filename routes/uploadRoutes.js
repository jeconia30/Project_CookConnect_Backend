const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protected routes dengan multer middleware
router.post(
  '/avatar',
  authMiddleware,
  upload.single('file'),
  uploadController.uploadAvatar
);

router.post(
  '/recipe',
  authMiddleware,
  upload.single('file'),
  uploadController.uploadRecipeImage
);

module.exports = router;