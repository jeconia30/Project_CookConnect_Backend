const { supabase, supabaseAdmin } = require("../config/supabaseClient");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerUser = async (userData) => {
  const { username, email, password, full_name } = userData;

  try {
    // 1. Cek user sudah ada?
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existingUser) {
      throw new Error("Username atau Email sudah terdaftar!");
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert user ke Supabase
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          username,
          email,
          password: hashedPassword,
          full_name,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    return {
      token,
      user_data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        avatar_url: newUser.avatar_url,
      },
    };
  } catch (error) {
    throw error;
  }
};

const login = async (loginData) => {
  const { username_or_email, password } = loginData;

  try {
    // 1. Cari user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${username_or_email},email.eq.${username_or_email}`)
      .single();

    if (error || !user) {
      throw new Error("User tidak ditemukan!");
    }

    // 2. Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Password salah!");
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    return {
      token,
      user_data: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { registerUser, login };