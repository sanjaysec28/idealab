import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Logo } from '../../components/navigation/Logo';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, sendPasswordReset, resolveDestinationPath, isBusy } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const intendedFrom = (location.state as { from?: string } | null)?.from;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Enter both your college email and password.');
      return;
    }

    try {
      const nextState = await signIn({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      });
      const destination = resolveDestinationPath(intendedFrom, nextState);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSent(false);

    if (!resetEmail.trim()) {
      setError('Enter your registered college email address.');
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordReset(resetEmail);
      setResetSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send password reset email.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-[#202124] flex flex-col justify-between px-5 py-6 sm:py-8">
      <div className="max-w-[420px] w-full mx-auto flex items-center justify-between">
        <Link to="/welcome" aria-label="IDEA LAB Home">
          <Logo size="sm" />
        </Link>
        <Link
          to="/welcome"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#777777] hover:text-[#202124] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>
      </div>

      <div className="max-w-[420px] w-full mx-auto my-6 bg-white rounded-2xl border border-[#EEEEEE] shadow-xs p-6 sm:p-8 space-y-5">
        {!forgotMode ? (
          <>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202124]">
                Sign in to IDEA LAB
              </h1>
              <p className="text-xs text-[#777777]">
                Enter your Saveetha college credentials to continue.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#202124] mb-1">
                  College Email Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@saveetha.ac.in"
                  className="w-full h-10 bg-white border border-[#EEEEEE] rounded-xl px-3.5 text-xs text-[#202124] placeholder-[#AAAAAA] focus:outline-none focus:border-[#E63946] transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-[#202124]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setResetSent(false);
                      setResetEmail(email);
                      setForgotMode(true);
                    }}
                    className="text-[11px] font-medium text-[#E63946] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-10 bg-white border border-[#EEEEEE] rounded-xl pl-3.5 pr-10 text-xs text-[#202124] placeholder-[#AAAAAA] focus:outline-none focus:border-[#E63946] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#202124] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#777777] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#DDDDDD] text-[#E63946] focus:ring-[#E63946]"
                />
                <span>Remember me on this device</span>
              </label>

              <button
                type="submit"
                disabled={isBusy}
                className="w-full h-10.5 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isBusy ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-[#EEEEEE] text-center">
              <p className="text-xs text-[#777777]">
                New to IDEA LAB?{' '}
                <Link to="/signup" className="text-[#E63946] font-semibold hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-[#202124]">
                Reset your password
              </h1>
              <p className="text-xs text-[#777777]">
                Enter your registered college email and we'll send a password reset link.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {resetSent && (
              <div className="p-3 rounded-xl bg-[#32B878]/10 border border-[#32B878]/30 text-[#1F7A4D] text-xs font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Password reset link sent to {resetEmail.trim().toLowerCase()}. Check your inbox.</span>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#202124] mb-1">
                  College Email Address
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@saveetha.ac.in"
                  className="w-full h-10 bg-white border border-[#EEEEEE] rounded-xl px-3.5 text-xs text-[#202124] placeholder-[#AAAAAA] focus:outline-none focus:border-[#E63946] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isResetting}
                className="w-full h-10.5 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
              >
                {isResetting ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setForgotMode(false);
                }}
                className="text-xs font-medium text-[#777777] hover:text-[#202124] cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>

      <p className="text-center text-[11px] text-[#777777]">
        Saveetha Engineering College • IDEA LAB
      </p>
    </div>
  );
};
