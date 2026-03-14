import { supabase, supabaseAdmin } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  canSendPasswordResetOtp,
  createPasswordResetOtp,
  getOtpCooldownSeconds,
  getOtpExpiryMinutes,
  verifyPasswordResetOtp,
} from '../services/passwordResetOtpStore.js';
import { sendPasswordResetOtpEmail } from '../services/mailer.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const isStrongPassword = (pass = '') => {
  const minLen = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/.test(pass);
  return minLen && hasUpper && hasLower && hasSpecial;
};

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
    
    // 1. Create user via regular signUp to trigger "Confirm sign up" email template.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { login_id }
      }
    });

    if (authError) {
      const msg = authError.message || 'Signup failed';

      if (/error sending confirmation email/i.test(msg)) {
        return res.status(400).json({
          message:
            'Signup confirmation email could not be sent. Check Supabase Authentication SMTP settings or disable custom SMTP there, then try again.'
        });
      }

      if (/email rate limit exceeded/i.test(msg)) {
        res.set('Retry-After', '60');
        return res.status(429).json({
          message: 'Email service is temporarily rate-limited. Please wait 60 seconds and try again.'
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
  return requestPasswordResetOtp(req, res);
};

export const requestPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'email is required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return res.status(404).json({ message: 'No account found for this email' });
    }

    const cooldown = canSendPasswordResetOtp(normalizedEmail);
    if (!cooldown.allowed) {
      res.set('Retry-After', String(cooldown.retryAfterSeconds));
      return res.status(429).json({
        message: `Please wait ${cooldown.retryAfterSeconds} seconds before requesting another OTP.`
      });
    }

    const otp = createPasswordResetOtp(normalizedEmail);

    try {
      await sendPasswordResetOtpEmail({
        email: normalizedEmail,
        otp,
        expiryMinutes: getOtpExpiryMinutes(),
      });
    } catch (mailError) {
      console.error('Reset password OTP failed:', mailError.message);
      return res.status(500).json({
        message: 'Could not send OTP email. Check SMTP_USER and SMTP_PASS in server .env.'
      });
    }

    return res.status(200).json({ message: 'OTP sent to your registered email' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const confirmPasswordResetOtp = async (req, res) => {
  try {
    const { email, token, otp, new_password } = req.body;
    const verificationToken = token || otp;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !verificationToken || !new_password) {
      return res.status(400).json({ message: 'email, otp, and new_password are required' });
    }

    if (!isStrongPassword(new_password)) {
      return res.status(400).json({
        message: 'Password needs 8+ chars, upper, lower, and special char'
      });
    }

    const otpVerification = verifyPasswordResetOtp(normalizedEmail, verificationToken);
    if (!otpVerification.valid) {
      return res.status(400).json({ message: otpVerification.message });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    if (!user?.id) {
      return res.status(404).json({ message: 'No account found for this email' });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({
        message: 'Server is missing SUPABASE_SERVICE_ROLE_KEY for secure password reset'
      });
    }

    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: new_password
    });

    if (updateAuthError) {
      return res.status(400).json({ message: updateAuthError.message || 'Could not update password' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id);

    if (updateUserError) {
      throw updateUserError;
    }

    return res.status(200).json({ message: 'Password reset successful. Please log in.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
