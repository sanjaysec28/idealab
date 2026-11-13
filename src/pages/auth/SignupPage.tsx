import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { IdeaLabLogo } from '../../components/shared/IdeaLabLogo';
import { useAuth } from '../../context/AuthContext';
import { isValidEmailAddress } from '../../firebase/authService';

function evaluatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  checks: {
    length: boolean;
    upper: boolean;
    lower: boolean;
    numberOrSymbol: boolean;
  };
} {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    numberOrSymbol: /[0-9!@#$%^&*(),.?":{}|<>_\-+=]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;

  if (score <= 1) {
    return { score, label: 'Weak', color: 'bg-[#E63946]', checks };
  }
  if (score === 2) {
    return { score, label: 'Fair', color: 'bg-amber-500', checks };
  }
  if (score === 3) {
    return { score, label: 'Good', color: 'bg-blue-500', checks };
  }
  return { score, label: 'Strong', color: 'bg-[#32B878]', checks };
}

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isBusy } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (fullName.trim().length < 2) {
      errors.fullName = 'Enter your full name (at least 2 characters).';
    }
    if (!isValidEmailAddress(email)) {
      errors.email = 'Enter a valid email address (e.g., Gmail, Outlook, Yahoo, or college email).';
    }
    if (password.length < 8 || strength.score < 3) {
      errors.password = 'Use 8+ characters with uppercase, lowercase, and a number or symbol.';
    }
    if (confirmPassword !== password || !confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    return errors;
  }, [fullName, email, password, confirmPassword, strength.score]);

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(fieldErrors).length > 0) {
      return;
    }

    try {
      await signup({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate('/verify-email', { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to create account.');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-[#202124] flex flex-col justify-between px-5 py-6 sm:py-8">
      <div className="max-w-[440px] w-full mx-auto flex items-center justify-between">
        <Link to="/welcome" aria-label="IDEA LAB Home">
          <IdeaLabLogo variant="auth" />
        </Link>
        <Link
          to="/welcome"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#777777] hover:text-[#202124] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>
      </div>

      <div className="max-w-[440px] w-full mx-auto my-6 bg-white rounded-2xl border border-[#EEEEEE] shadow-xs p-6 sm:p-8 space-y-5">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202124]">
            Create your account
          </h1>
          <p className="text-xs text-[#777777]">
            Register with any valid email address to verify your account, build your timetable, and access IDEA LAB.
          </p>
        </div>

        {submitError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-[#202124] mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => markTouched('fullName')}
              placeholder="Ananya Sharma"
              className="w-full h-10 bg-white border border-[#EEEEEE] rounded-xl px-3.5 text-xs text-[#202124] placeholder-[#AAAAAA] focus:outline-none focus:border-[#E63946] transition-colors"
            />
            {touched.fullName && fieldErrors.fullName && (
              <p className="mt-1 text-[11px] text-[#E63946]">{fieldErrors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#202124] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => markTouched('email')}
              placeholder="you@example.com"
              className="w-full h-10 bg-white border border-[#EEEEEE] rounded-xl px-3.5 text-xs text-[#202124] placeholder-[#AAAAAA] focus:outline-none focus:border-[#E63946] transition-colors"
            />
            {touched.email && fieldErrors.email && (
              <p className="mt-1 text-[11px] text-[#E63946]">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-[#202124]">
                Password
              </label>
              {password.length > 0 && (
                <span className="text-[10px] font-semibold text-[#777777]">
                  Strength: <span className="text-[#202124]">{strength.label}</span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => markTouched('password')}
                placeholder="At least 8 characters"
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

            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 rounded-full transition-colors ${
                        strength.score >= step ? strength.color : 'bg-[#EEEEEE]'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#777777]">
                  <span className={`inline-flex items-center gap-1 ${strength.checks.length ? 'text-[#32B878]' : ''}`}>
                    <Check className="w-3 h-3" /> 8+ chars
                  </span>
                  <span className={`inline-flex items-center gap-1 ${strength.checks.upper && strength.checks.lower ? 'text-[#32B878]' : ''}`}>
                    <Check className="w-3 h-3" /> Upper & lower
                  </span>
                  <span className={`inline-flex items-center gap-1 ${strength.checks.numberOrSymbol ? 'text-[#32B878]' : ''}`}>
                    <Check className="w-3 h-3" /> Number / symbol
                  </span>
                </div>
              </div>
            )}

            {touched.password && fieldErrors.password && (
              <p className="mt-1 text-[11px] text-[#E63946]">{fieldErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#202124] mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => markTouched('confirmPassword')}
                placeholder="Re-enter your password"
                className="w-full h-10 bg-white border border-[#EEEEEE] rounded-xl pl-3.5 pr-10 text-xs text-[#202124] placeholder-[#AAAAAA] focus:outline-none focus:border-[#E63946] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#202124] cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {touched.confirmPassword && fieldErrors.confirmPassword && (
              <p className="mt-1 text-[11px] text-[#E63946]">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isBusy}
            className="w-full h-10.5 mt-1 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isBusy ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-[#EEEEEE] text-center">
          <p className="text-xs text-[#777777]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#E63946] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center text-[11px] text-[#777777]">
        Saveetha Engineering College • IDEA LAB
      </p>
    </div>
  );
};
