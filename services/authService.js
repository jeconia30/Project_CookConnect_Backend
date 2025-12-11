const { supabase, supabaseAdmin } = require("../config/supabaseClient");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const registerUser = async (userData) => {
  const { username, email, password, full_name } = userData;

  try {
    // 1. Cek user sudah ada? Gunakan maybeSingle() agar tidak error jika kosong
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .maybeSingle();

    // Jika ada error database beneran (bukan sekadar data kosong)
    if (checkError) throw checkError;

    // Jika user ditemukan, lempar error validasi
    if (existingUser) {
      throw new Error("Username atau Email sudah terdaftar!");
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert user ke Supabase
    // PENTING: Tangkap error insert ke variabel 'insertError'
    const { data: newUser, error: insertError } = await supabaseAdmin
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

    // Cek error hasil insert
    if (insertError) throw insertError;

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

const verifyUserForReset = async (data) => {
  const { full_name, username, email } = data;

  try {
    // Cari user yang username DAN email-nya cocok
    // Kita gunakan ilike untuk full_name agar tidak sensitif huruf besar/kecil
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, username')
      .eq('email', email)
      .eq('username', username)
      .ilike('full_name', full_name) 
      .maybeSingle(); // Gunakan maybeSingle agar tidak error jika tidak ketemu

    if (error) {
      throw error;
    }

    // Jika user kosong (tidak ditemukan)
    if (!user) {
      return null; 
    }

    // Jika ketemu, kembalikan data user
    return user;
  } catch (error) {
    throw error;
  }
};

module.exports = { registerUser, login, verifyUserForReset };