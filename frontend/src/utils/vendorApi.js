// src/utils/supabaseApi.js
import { createClient } from '@supabase/supabase-js';

// ✅ No need for dotenv in frontend React (only used in Node.js backend)
// ❌ Remove this line:
// import env from 'dotenv';
// env.config();

// ✅ Environment variables in Vite must be prefixed with `VITE_`
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// ✅ Insert vendor data
export const insertVendor = async (formData) => {
  const { data, error } = await supabase.from('Vendors').insert([formData]);

  if (error) {
    console.error('Insert error:', error);
    throw error;
  }

  return data;
};
