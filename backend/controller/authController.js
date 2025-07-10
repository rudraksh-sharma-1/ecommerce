import { supabase } from '../config/supabaseClient.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { setSessionCookie, clearSessionCookie } from '../utils/cookieUtils.js';

export const signup = async (req, res) => {
  const { first_name, last_name, phone_no,email, pan, gstin, adhaar_no, business_type } = req.body;
  let { password } = req.body;

  password = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('business_users')
    .insert([{ first_name, last_name, phone_no, pan, gstin, adhaar_no, email, password, business_type }]);

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ message: 'Business user created' });
};

export const login = async (req, res) => {
  const { email, password, business_type } = req.body;

  const { data, error } = await supabase
    .from('business_users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return res.status(400).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, data.password);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });

  const validBusinessType = data.business_type === business_type;
  if (!validBusinessType) return res.status(403).json({ error: 'Unauthorized business type' });

  const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  setSessionCookie(res, token);

  res.json({ message: 'Logged in', user: { id: data.id, username: data.username, email: data.email } });
};


export const getAllBusinessUsers = async (req,res) => {
  try {
  const { data, error } = await supabase
    .from('business_users')
    .select('*');

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json(data);
  } 
  catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const logout = (req, res) => {
  clearSessionCookie(res);
  res.json({ message: 'Logged out' });
};

export const getMe = (req, res) => {
  res.json({ user: req.user });
};

