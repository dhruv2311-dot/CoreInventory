import { supabase, supabaseAdmin } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const signup = async (req, res) => {
  try {
    const { login_id, email, password } = req.body;

    if (!login_id || !email || !password) {
      return res.status(400).json({ message: 'login_id, email, and password are required' });
    }
    
    // Check login_id and email independently for deterministic duplicate errors.
    const { data: existingLoginId, error: existingLoginError } = await supabase
      .from('users')
      .select('id')
      .eq('login_id', login_id)
      .maybeSingle();

    if (existingLoginError) {
      throw existingLoginError;
    }

    if (existingLoginId) {
      return res.status(409).json({ message: 'Login ID is already taken' });
    }

    const { data: existingEmail, error: existingEmailError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingEmailError) {
      throw existingEmailError;
    }
      
    if (existingEmail) {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    
    // 1. Create user in Supabase Auth.
    // If service role key is configured, use admin API to bypass email rate limits.
    let authData;
    let authError;
    let signupMode = 'standard';

    if (supabaseAdmin) {
      signupMode = 'admin';
      const response = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { login_id }
      });
      authData = response.data;
      authError = response.error;
    } else {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { login_id }
        }
      });
      authData = response.data;
      authError = response.error;
    }

    if (authError) {
      const msg = authError.message || 'Signup failed';

      if (/email rate limit exceeded/i.test(msg)) {
        return res.status(429).json({
          message:
            'Signup is temporarily rate-limited by Supabase. Add SUPABASE_SERVICE_ROLE_KEY on server to bypass this limit for backend-created users, or wait and retry.'
        });
      }

      const status = /already registered/i.test(msg) ? 409 : 400;
      return res.status(status).json({ message: msg });
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
      
    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ message: 'User already exists' });
      }
      throw error;
    }
    
    const message =
      signupMode === 'admin'
        ? 'Account created successfully. You can now sign in.'
        : 'Account created! Please check your email to verify your account.';

    res.status(201).json({ 
      message,
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
