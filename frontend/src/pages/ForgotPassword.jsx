import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';

const validatePassword = (pass) => {
  const minLen = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/.test(pass);
  return minLen && hasUpper && hasLower && hasSpecial;
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (cooldownSeconds <= 0) return undefined;

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const requestOtp = async (e) => {
    e.preventDefault();

    if (loading || inFlightRef.current || cooldownSeconds > 0) {
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);
    inFlightRef.current = true;

    try {
      const response = await authApi.requestPasswordReset({ email });
      setMessage(response.message || 'OTP sent to your registered email.');
      setStep(2);
    } catch (err) {
      if (err?.status === 429) {
        const waitSeconds = err?.retryAfter || 60;
        setCooldownSeconds(waitSeconds);
        setError(`Email rate-limited by Supabase. Please wait ${waitSeconds} seconds before retrying.`);
      } else {
        setError(err.message || 'Could not send OTP');
      }
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!validatePassword(newPassword)) {
      return setError('Password needs 8+ chars, upper, lower, and special char');
    }

    setLoading(true);
    inFlightRef.current = true;

    try {
      const response = await authApi.confirmPasswordReset({
        email,
        otp,
        new_password: newPassword,
      });
      setMessage(response.message || 'Password reset successful. Please log in.');
      setStep(1);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Could not reset password');
    } finally {
      setLoading(false);
      inFlightRef.current = false;
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
          <p className="text-gray-400">
            {step === 1 ? 'Get OTP on your registered email' : 'Verify OTP and set new password'}
          </p>
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

        {step === 1 ? (
          <form onSubmit={requestOtp} className="space-y-6">
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
              disabled={loading || cooldownSeconds > 0}
              className="w-full btn-primary py-3 text-sm font-semibold"
            >
              {loading
                ? 'Sending OTP...'
                : cooldownSeconds > 0
                ? `Retry in ${cooldownSeconds}s`
                : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Registered Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="theme-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">OTP</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                className="theme-input w-full"
                placeholder="Enter OTP received in email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="theme-input w-full"
                placeholder="New secure password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="theme-input w-full"
                placeholder="Re-enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-sm font-semibold"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

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
