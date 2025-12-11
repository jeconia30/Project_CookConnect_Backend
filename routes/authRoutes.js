// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// URL: POST /api/auth/register
router.post("/register", authController.register);

// URL: POST /api/auth/login  <-- TAMBAHAN BARU
router.post("/login", authController.login);

router.post("/verify-user", authController.verifyUser);

module.exports = router;
