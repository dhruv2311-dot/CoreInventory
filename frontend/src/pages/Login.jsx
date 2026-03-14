import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';

export default function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { token, user } = await authApi.login({ login_id: loginId, password });
      login(user, token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
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
          <h2 className="text-3xl font-bold font-poppins tracking-tight mb-2">CoreInventory</h2>
          <p className="text-gray-400">Sign in to your enterprise account</p>
        </div>
        
        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <span className="shrink-0">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Employee ID</label>
            <input
              type="text"
              required
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="theme-input w-full"
              placeholder="e.g. EMP-101"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <Link to="/forgot-password" className="text-sm font-medium text-accent hover:text-white transition-colors duration-200">
                Recover access
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="theme-input w-full"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm font-semibold mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-400 font-medium">
            New employee?{' '}
            <Link to="/signup" className="text-accent hover:text-white transition-colors">
              Request account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
