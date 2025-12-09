const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    // Tambahkan 5173 ke daftar origin yang diizinkan
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ IMPORT SEMUA ROUTES
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const commentRoutes = require("./routes/commentRoutes"); // ✅ BARU
const interactionRoutes = require("./routes/interactionRoutes"); // ✅ BARU
const notificationRoutes = require("./routes/notificationRoutes"); // ✅ BARU

// ✅ REGISTER SEMUA ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/comments", commentRoutes); // ✅ BARU
app.use("/api/interactions", interactionRoutes); // ✅ BARU
app.use("/api/notifications", notificationRoutes); // ✅ BARU

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "✅ CookConnect Backend Aktif!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ✅ ERROR HANDLING GLOBAL
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ✅ 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint tidak ditemukan",
    path: req.path,
  });
});

app.listen(port, () => {
  console.log(`🚀 Server jalan di http://localhost:${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
