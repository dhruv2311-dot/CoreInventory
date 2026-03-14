import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabaseClient } from '../config/supabaseClient';

const validatePassword = (pass) => {
  const minLen = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/.test(pass);
  return minLen && hasUpper && hasLower && hasSpecial;
};

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Supabase puts recovery data in URL; this confirms user reached via reset link.
    supabaseClient.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setReady(Boolean(data.session));
    });

    const { data: listener } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY' || session) {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!ready) {
      return setError('Invalid or expired reset link. Please request a new password reset email.');
    }

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!validatePassword(newPassword)) {
      return setError('Password needs 8+ chars, upper, lower, and special char');
    }

    setLoading(true);
    const { error: updateError } = await supabaseClient.auth.updateUser({ password: newPassword });

    if (updateError) {
      setError(updateError.message || 'Could not reset password');
      setLoading(false);
      return;
    }

    setMessage('Password reset successful. Redirecting to login...');
    setLoading(false);
    setTimeout(() => navigate('/login'), 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4 font-inter text-white">
      <div className="max-w-md w-full theme-card p-10 animate-in slide-in-from-bottom-8 duration-500">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent text-black font-poppins font-bold text-2xl flex items-center justify-center shadow-lg">
              C
            </div>
          </div>
          <h2 className="text-3xl font-bold font-poppins tracking-tight mb-2">Set New Password</h2>
          <p className="text-gray-400">Use the link from your reset email to set a new password</p>
        </div>

        {message && (
          <div className="bg-green-600/10 border border-green-500/30 text-green-300 p-3 rounded-lg mb-6 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="theme-input w-full"
              placeholder="New secure password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="theme-input w-full"
              placeholder="Re-enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm font-semibold"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 font-medium mt-6">
          Back to{' '}
          <Link to="/login" className="text-accent hover:text-white transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
