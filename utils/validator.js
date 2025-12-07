const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateUsername = (username) => {
  // Username: 3-20 karakter, hanya a-z, 0-9, underscore
  const usernameRegex = /^[a-z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

const validatePassword = (password) => {
  // Minimal 8 karakter, harus ada huruf dan angka
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};

const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} tidak boleh kosong`;
  }
  return null;
};

const validateMinLength = (value, min, fieldName) => {
  if (value && value.toString().length < min) {
    return `${fieldName} minimal ${min} karakter`;
  }
  return null;
};

const validateMaxLength = (value, max, fieldName) => {
  if (value && value.toString().length > max) {
    return `${fieldName} maksimal ${max} karakter`;
  }
  return null;
};

const validateNumber = (value, fieldName) => {
  if (value && isNaN(value)) {
    return `${fieldName} harus berupa angka`;
  }
  return null;
};

const validateArray = (value, fieldName) => {
  if (!Array.isArray(value)) {
    return `${fieldName} harus berupa array`;
  }
  return null;
};

// Validate Register Input
const validateRegisterInput = (data) => {
  const errors = {};

  // Validate name
  const nameError = validateRequired(data.full_name, 'Nama');
  if (nameError) errors.full_name = nameError;
  else {
    const nameMinError = validateMinLength(data.full_name, 3, 'Nama');
    if (nameMinError) errors.full_name = nameMinError;
  }

  // Validate email
  const emailError = validateRequired(data.email, 'Email');
  if (emailError) {
    errors.email = emailError;
  } else if (!validateEmail(data.email)) {
    errors.email = 'Format email tidak valid';
  }

  // Validate username
  const usernameError = validateRequired(data.username, 'Username');
  if (usernameError) {
    errors.username = usernameError;
  } else if (!validateUsername(data.username)) {
    errors.username = 'Username harus 3-20 karakter (huruf kecil, angka, underscore)';
  }

  // Validate password
  const passwordError = validateRequired(data.password, 'Password');
  if (passwordError) {
    errors.password = passwordError;
  } else if (!validatePassword(data.password)) {
    errors.password = 'Password minimal 8 karakter (harus ada huruf dan angka)';
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

// Validate Login Input
const validateLoginInput = (data) => {
  const errors = {};

  const usernameError = validateRequired(data.username_or_email, 'Email/Username');
  if (usernameError) errors.username_or_email = usernameError;

  const passwordError = validateRequired(data.password, 'Password');
  if (passwordError) errors.password = passwordError;

  return Object.keys(errors).length > 0 ? errors : null;
};

// Validate Create Recipe
const validateCreateRecipeInput = (data) => {
  const errors = {};

  const titleError = validateRequired(data.title, 'Judul');
  if (titleError) {
    errors.title = titleError;
  } else {
    const titleMaxError = validateMaxLength(data.title, 100, 'Judul');
    if (titleMaxError) errors.title = titleMaxError;
  }

  const descError = validateRequired(data.description, 'Deskripsi');
  if (descError) errors.description = descError;

  const imageError = validateRequired(data.image_url, 'Gambar');
  if (imageError) errors.image_url = imageError;

  const timeError = validateNumber(data.total_time, 'Waktu Total');
  if (timeError) errors.total_time = timeError;

  const servingError = validateNumber(data.servings, 'Porsi');
  if (servingError) errors.servings = servingError;

  const diffError = validateRequired(data.difficulty, 'Tingkat Kesulitan');
  if (diffError) errors.difficulty = diffError;
  else if (!['Mudah', 'Sedang', 'Sulit'].includes(data.difficulty)) {
    errors.difficulty = 'Tingkat kesulitan harus: Mudah, Sedang, atau Sulit';
  }

  const ingredError = validateArray(data.ingredients, 'Bahan-bahan');
  if (ingredError) {
    errors.ingredients = ingredError;
  } else if (data.ingredients.length === 0) {
    errors.ingredients = 'Minimal 1 bahan diperlukan';
  }

  const stepsError = validateArray(data.steps, 'Langkah-langkah');
  if (stepsError) {
    errors.steps = stepsError;
  } else if (data.steps.length === 0) {
    errors.steps = 'Minimal 1 langkah diperlukan';
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

// Validate Update Profile
const validateUpdateProfileInput = (data) => {
  const errors = {};

  if (data.username && !validateUsername(data.username)) {
    errors.username = 'Username harus 3-20 karakter (huruf kecil, angka, underscore)';
  }

  if (data.full_name && data.full_name.length < 3) {
    errors.full_name = 'Nama minimal 3 karakter';
  }

  if (data.bio && data.bio.length > 500) {
    errors.bio = 'Bio maksimal 500 karakter';
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

module.exports = {
  validateEmail,
  validateUsername,
  validatePassword,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateNumber,
  validateArray,
  validateRegisterInput,
  validateLoginInput,
  validateCreateRecipeInput,
  validateUpdateProfileInput,
};