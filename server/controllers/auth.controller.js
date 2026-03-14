import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const signup = async (req, res) => {
  try {
    const { login_id, email, password } = req.body;
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`login_id.eq.${login_id},email.eq.${email}`)
      .single();
      
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert({ login_id, email, password: hashedPassword })
      .select('id, login_id, email, created_at')
      .single();
      
    if (error) throw error;
    
    res.status(201).json({ message: 'User created successfully', user: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { login_id, password } = req.body;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('login_id', login_id)
      .single();
      
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, login_id: user.login_id }, JWT_SECRET, { expiresIn: '1d' });
    
    res.status(200).json({ token, user: { id: user.id, login_id: user.login_id, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  // basic mock for forgotten password using OTP flow
  res.status(200).json({ message: 'OTP sent successfully (Mock)' });
};
