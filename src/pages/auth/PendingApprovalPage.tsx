import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Hourglass, CheckCircle2, RefreshCw } from 'lucide-react';
import { Logo } from '../../components/navigation/Logo';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import { AuthLoadingScreen } from '../../components/auth/AuthGuard';

export const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    studentProfile,
    authState,
    refreshMembership,
    signOut,
    resolveDestinationPath,
  } = useAuth();
  const { withBackgroundRefresh } = useLoading();

  const [isChecking, setIsChecking] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const intendedFrom = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    if (authState === 'loading') return;
    if (authState === 'unauthenticated' || !user) {
      navigate('/welcome', { replace: true });
      return;
    }
    if (authState === 'unverified_email') {
      navigate('/verify-email', { replace: true });
      return;
    }
    if (authState === 'needs_membership_request') {
      navigate('/membership-request', { replace: true });
      return;
    }
    if (authState === 'approved') {
      navigate(resolveDestinationPath(intendedFrom), { replace: true });
      return;
    }
    if (authState === 'rejected') {
      navigate('/membership-rejected', { replace: true });
    }
  }, [authState, user, intendedFrom, navigate, resolveDestinationPath]);

  if (authState === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (!user || !studentProfile) {
    return null;
  }

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setStatusFeedback(null);
    try {
      const updated = await withBackgroundRefresh(refreshMembership());
      if (updated?.membershipStatus === 'pending') {
        setStatusFeedback('Still under review. You will be redirected once approved.');
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome', { replace: true });
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#FAF8F5] text-[#202124] flex flex-col items-center justify-between px-[20px] pt-[max(16px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))]">
      {/* Top IDEA LAB Logo */}
      <div className="shrink-0 pt-1">
        <Logo size="sm" />
      </div>

      {/* Single Centered White Card */}
      <main className="w-full max-w-[440px] bg-white rounded-2xl border border-[#EEEEEE] shadow-xs px-5 py-6 sm:px-7 sm:py-7 text-center space-y-4 sm:space-y-5">
        <div className="w-11 h-11 rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-[#D97706] flex items-center justify-center mx-auto">
          <Hourglass className="w-5 h-5" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#202124]">
            Your request is under review
          </h1>
          <p className="text-xs sm:text-[13px] text-[#777777] leading-relaxed">
            Your IDEA LAB membership request has been submitted successfully. Our coordinators will review your details and notify you once your account is approved.
          </p>
        </div>

        {/* Registered Email + Pending Approval Status Row */}
        <div className="rounded-xl bg-[#FAF8F5] border border-[#EEEEEE] px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-[#202124] truncate min-w-0">
            {studentProfile.email || user.email}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] text-[11px] font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] animate-pulse" />
            Pending Approval
          </span>
        </div>

        {/* Compact Submission Confirmation Message */}
        <p className="inline-flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#32B878]">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>
            {statusFeedback || 'Application submitted and queued for coordinator review'}
          </span>
        </p>

        {/* Actions */}
        <div className="space-y-2.5 pt-0.5">
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full h-10 sm:h-10.5 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking...' : 'Check Status'}</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-medium text-[#777777] hover:text-[#202124] transition-colors cursor-pointer py-1"
          >
            Sign Out
          </button>
        </div>
      </main>

      {/* Compact Footer */}
      <p className="shrink-0 text-[11px] text-[#777777]">
        Saveetha Engineering College • IDEA LAB
      </p>
    </div>
  );
};
