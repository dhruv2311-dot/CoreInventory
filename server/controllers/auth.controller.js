import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const signup = async (req, res) => {
  try {
    const { login_id, email, password } = req.body;
    
    // Check if user already exists in our table to prevent duplicates
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`login_id.eq.${login_id},email.eq.${email}`)
      .maybeSingle();
      
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // 1. Create user in Supabase Auth (This triggers the Confirmation Email!)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { login_id }
      }
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }
    
    // 2. Hash password just to satisfy our physical public table NOT NULL constraint
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 3. Keep our public.users table synchronized
    const id = authData.user ? authData.user.id : undefined;
    const { data, error } = await supabase
      .from('users')
      .insert({ id, login_id, email, password: hashedPassword })
      .select('id, login_id, email, created_at')
      .single();
      
    if (error) throw error;
    
    res.status(201).json({ 
      message: 'Account created! Please check your email to verify your account.', 
      user: data 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { login_id, password } = req.body;
    
    // 1. Fetch the user's email from our table using their login_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('login_id', login_id)
      .maybeSingle();
      
    if (userError || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // 2. Authenticate securely via Supabase Auth (This blocks unverified emails)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password
    });

    if (authError) {
      // This will automatically relay "Email not confirmed" or "Invalid login credentials"
      return res.status(401).json({ message: authError.message });
    }
    
    // 3. Issue our own JWT for app-wide authorization
    const token = jwt.sign({ id: user.id, login_id: user.login_id }, JWT_SECRET, { expiresIn: '1d' });
    
    res.status(200).json({ 
      token, 
      user: { id: user.id, login_id: user.login_id, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  // basic mock for forgotten password using OTP flow
  res.status(200).json({ message: 'OTP sent successfully (Mock)' });
};
