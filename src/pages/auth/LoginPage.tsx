import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, Mail, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { Logo } from '../../components/navigation/Logo';
import { useAuth } from '../../context/AuthContext';
import { GoogleSignInModal } from '../../components/auth/GoogleSignInModal';
import { GoogleSignInOptions } from '../../types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, signInWithEmail, resolveDestinationPath, isAuthLoading, authError } = useAuth();
  const [useEmailForm, setUseEmailForm] = useState(false);
  const [email, setEmail] = useState('ananya.sec2024101@saveetha.ac.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const intendedFrom = (location.state as { from?: string } | null)?.from;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      const result = await signInWithEmail({ email, password });
      const destination = resolveDestinationPath(intendedFrom, result.membership, result.profile);
      navigate(destination, { replace: true, state: { from: intendedFrom } });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Unable to sign in.');
    }
  };

  const handleSelectGoogleAccount = async (options: GoogleSignInOptions) => {
    setLocalError(null);
    const result = await signInWithGoogle(options);
    setShowGoogleModal(false);
    const destination = resolveDestinationPath(intendedFrom, result.membership, result.profile);
    navigate(destination, { replace: true, state: { from: intendedFrom } });
  };

  const activeError = localError || authError;

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col justify-center items-center p-6 text-[#202124] relative">
      <div className="absolute top-6 left-6">
        <Link
          to="/welcome"
          className="flex items-center gap-2 text-xs font-semibold text-[#777777] hover:text-[#202124] bg-white px-4 py-2 rounded-xl border border-[#EEEEEE] shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl border border-[#EEEEEE] p-8 lg:p-10 shadow-xl space-y-6 text-center">
        <div className="flex justify-center mb-2">
          <Logo size="md" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-[#202124]">Welcome Back! 👋</h1>
          <p className="text-xs text-[#777777]">Sign in to verify your IDEA LAB membership and continue.</p>
        </div>

        {activeError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{activeError}</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={isAuthLoading}
            onClick={() => setShowGoogleModal(true)}
            className="w-full flex items-center justify-center gap-3 bg-[#E63946] hover:bg-[#d62839] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-[#E63946]/20 transition-all text-xs cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#EEEEEE]"></div>
            <span className="flex-shrink mx-4 text-xs text-[#777777]">or</span>
            <div className="flex-grow border-t border-[#EEEEEE]"></div>
          </div>

          {!useEmailForm ? (
            <button
              type="button"
              onClick={() => setUseEmailForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#FAFAFA] text-[#202124] border border-[#EEEEEE] font-semibold py-3.5 px-6 rounded-2xl shadow-sm transition-all text-xs cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#777777]" />
              <span>Continue with Email</span>
            </button>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 text-left pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5 uppercase tracking-wider">
                  College Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@saveetha.ac.in"
                  className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[#777777]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#E63946] hover:bg-[#d62839] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-[#E63946]/20 transition-all text-xs cursor-pointer disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                <span>{isAuthLoading ? 'Verifying...' : 'Sign In'}</span>
              </button>
            </form>
          )}
        </div>

        <p className="text-xs text-[#777777] pt-2">
          New to IDEA LAB?{' '}
          <Link to="/join" className="text-[#E63946] font-bold hover:underline">
            Request to Join
          </Link>
        </p>
      </div>

      <div className="mt-8 text-xs text-[#777777]">
        Saveetha Engineering College • IDEA Lab
      </div>

      <GoogleSignInModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectAccount={handleSelectGoogleAccount}
        isSubmitting={isAuthLoading}
      />
    </div>
  );
};
