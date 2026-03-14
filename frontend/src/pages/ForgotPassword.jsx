import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestResetLink = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authApi.requestPasswordReset({ email });
      setMessage(response.message || 'Password reset link sent to your registered email.');
    } catch (err) {
      setError(err.message || 'Could not send reset link');
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-3xl font-bold font-poppins tracking-tight mb-2">Reset Password</h2>
          <p className="text-gray-400">Get a reset link on your registered email</p>
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

        <form onSubmit={requestResetLink} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Registered Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="theme-input w-full"
              placeholder="you@company.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm font-semibold"
          >
            {loading ? 'Sending Link...' : 'Send Reset Link'}
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
