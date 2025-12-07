const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Client biasa (untuk auth + read)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Admin client (untuk operasi sensitive)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase, supabaseAdmin };