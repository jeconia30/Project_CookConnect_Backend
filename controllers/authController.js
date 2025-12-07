const authService = require("../services/authService");
const { successResponse, errorResponse, validationErrorResponse } = require("../utils/responseFormatter");
const { validateRegisterInput, validateLoginInput } = require("../utils/validator");

const register = async (req, res) => {
  try {
    const { full_name, email, username, password } = req.body;

    // 1. VALIDASI INPUT
    const validationErrors = validateRegisterInput({
      full_name,
      email,
      username,
      password,
    });

    if (validationErrors) {
      return validationErrorResponse(res, validationErrors);
    }

    // 2. PANGGIL SERVICE
    const result = await authService.registerUser({
      full_name,
      email,
      username,
      password,
    });

    // 3. RESPONSE SUKSES
    return successResponse(
      res,
      {
        token: result.token,
        user: result.user_data,
      },
      "Registrasi berhasil! Silakan login.",
      201
    );
  } catch (error) {
    console.error("Register Error:", error);

    // Handle duplicate email/username
    if (error.message.includes("terdaftar")) {
      return errorResponse(res, error.message, 400);
    }

    return errorResponse(res, "Gagal melakukan registrasi", 500);
  }
};

const login = async (req, res) => {
  try {
    const { username_or_email, password } = req.body;

    // 1. VALIDASI INPUT
    const validationErrors = validateLoginInput({
      username_or_email,
      password,
    });

    if (validationErrors) {
      return validationErrorResponse(res, validationErrors);
    }

    // 2. PANGGIL SERVICE
    const result = await authService.login({
      username_or_email,
      password,
    });

    // 3. RESPONSE SUKSES
    return successResponse(
      res,
      {
        token: result.token,
        user: result.user_data,
      },
      "Login berhasil! Selamat datang."
    );
  } catch (error) {
    console.error("Login Error:", error);

    // Handle specific errors
    if (error.message.includes("tidak ditemukan")) {
      return errorResponse(res, error.message, 401);
    }

    if (error.message.includes("salah")) {
      return errorResponse(res, error.message, 401);
    }

    return errorResponse(res, "Gagal login", 500);
  }
};

module.exports = { register, login };