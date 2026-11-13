import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailCheck, RefreshCw, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Logo } from '../../components/navigation/Logo';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import { AuthLoadingScreen } from '../../components/auth/AuthGuard';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    authState,
    resendVerificationEmail,
    refreshVerificationStatus,
    signOut,
    resolveDestinationPath,
  } = useAuth();
  const { withBackgroundRefresh } = useLoading();

  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (authState === 'loading') return;
    if (authState === 'unauthenticated' || !user) {
      navigate('/welcome', { replace: true });
      return;
    }
    if (authState !== 'unverified_email') {
      navigate(resolveDestinationPath(), { replace: true });
    }
  }, [authState, user, navigate, resolveDestinationPath]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  if (authState === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return null;
  }

  const handleCheckVerification = async () => {
    setIsChecking(true);
    setNotice(null);
    try {
      const verified = await withBackgroundRefresh(refreshVerificationStatus());
      if (verified) {
        setNotice({ type: 'success', text: 'Email verified! Redirecting to membership request...' });
      } else {
        setNotice({
          type: 'info',
          text: 'Your email is not verified yet. Please click the verification link sent to your inbox.',
        });
      }
    } catch (err) {
      setNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to check verification status.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    setNotice(null);
    try {
      await resendVerificationEmail();
      setCooldown(45);
      setNotice({
        type: 'success',
        text: `Verification email sent to ${user.email}. Please check your inbox or spam folder.`,
      });
    } catch (err) {
      setNotice({
        type: 'error',
        text: err instanceof Error ? err.message : 'Could not resend verification email.',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome', { replace: true });
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-[#202124] flex flex-col justify-between px-5 py-6 sm:py-8">
      <div className="max-w-[430px] w-full mx-auto flex justify-center">
        <Logo size="sm" />
      </div>

      <div className="max-w-[430px] w-full mx-auto my-6 bg-white rounded-2xl border border-[#EEEEEE] shadow-xs p-6 sm:p-8 space-y-5 text-center">
        <div className="w-11 h-11 rounded-full bg-[#FFF0F1] text-[#E63946] flex items-center justify-center mx-auto">
          <MailCheck className="w-5 h-5" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-[#202124]">
            Verify your email
          </h1>
          <p className="text-xs text-[#777777] leading-relaxed">
            We sent a verification link to your email address. Verify your email before submitting your IDEA LAB membership request.
          </p>
        </div>

        <div className="rounded-xl bg-[#FAF8F5] border border-[#EEEEEE] px-3.5 py-2.5 text-xs flex items-center justify-between gap-2">
          <span className="text-[#777777]">Sent to</span>
          <span className="font-semibold text-[#202124] truncate">{user.email}</span>
        </div>

        {notice && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 text-left border ${
              notice.type === 'success'
                ? 'bg-[#32B878]/10 border-[#32B878]/30 text-[#1F7A4D]'
                : notice.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-[#FAF8F5] border-[#EEEEEE] text-[#555555]'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{notice.text}</span>
          </div>
        )}

        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            disabled={isChecking}
            onClick={handleCheckVerification}
            className="w-full h-10.5 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking Verification...' : 'Refresh Verification Status'}</span>
          </button>

          <button
            type="button"
            disabled={isResending || cooldown > 0}
            onClick={handleResend}
            className="w-full h-10 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#202124] border border-[#EEEEEE] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 text-[#777777]" />
            <span>
              {cooldown > 0
                ? `Resend Email in ${cooldown}s`
                : isResending
                ? 'Sending...'
                : 'Resend Verification Email'}
            </span>
          </button>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-medium text-[#777777] hover:text-[#202124] cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] text-[#777777]">
        Saveetha Engineering College • IDEA LAB
      </p>
    </div>
  );
};
