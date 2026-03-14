import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';

export default function Signup() {
  const [formData, setFormData] = useState({ loginId: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (pass) => {
    const minLen = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pass);
    return minLen && hasUpper && hasLower && hasSpecial;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.loginId.length < 6 || formData.loginId.length > 12) {
      return setError('Login ID must be 6-12 characters long');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!validatePassword(formData.password)) {
      return setError('Password needs 8+ chars, upper, lower, and special char');
    }

    setLoading(true);

    try {
      await authApi.signup({
        login_id: formData.loginId,
        email: formData.email,
        password: formData.password
      });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4 py-12 font-inter text-white">
      <div className="max-w-md w-full theme-card p-10 animate-in slide-in-from-bottom-8 duration-500">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent text-black font-poppins font-bold text-2xl flex items-center justify-center shadow-lg">
              C
            </div>
          </div>
          <h2 className="text-3xl font-bold font-poppins tracking-tight mb-2">Setup Account</h2>
          <p className="text-gray-400">Join the CoreInventory enterprise</p>
        </div>
        
        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <span className="shrink-0">⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Employee ID</label>
            <input
              type="text"
              name="loginId"
              required
              value={formData.loginId}
              onChange={handleChange}
              className="theme-input w-full"
              placeholder="Min 6 characters e.g., EMP-101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Corporate Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="theme-input w-full"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="theme-input w-full"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="theme-input w-full"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm font-semibold mt-4"
          >
            {loading ? 'Creating Identity...' : 'Register Account'}
          </button>

          <p className="text-center text-sm text-gray-400 font-medium">
            Already verified?{' '}
            <Link to="/login" className="text-accent hover:text-white transition-colors">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
