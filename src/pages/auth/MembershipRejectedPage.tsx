import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Mail, RefreshCw } from 'lucide-react';
import { Logo } from '../../components/navigation/Logo';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import { AuthLoadingScreen } from '../../components/auth/AuthGuard';

export const MembershipRejectedPage: React.FC = () => {
  const navigate = useNavigate();
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
      navigate(resolveDestinationPath(), { replace: true });
      return;
    }
    if (authState === 'pending') {
      navigate('/pending-approval', { replace: true });
    }
  }, [authState, user, navigate, resolveDestinationPath]);

  if (authState === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (!user || !studentProfile) {
    return null;
  }

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      await withBackgroundRefresh(refreshMembership());
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome', { replace: true });
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#FAF8F5] text-[#202124] flex flex-col items-center justify-between px-[20px] py-6 sm:py-8">
      <div className="shrink-0">
        <Logo size="sm" />
      </div>

      <main className="w-full max-w-[440px] bg-white rounded-2xl border border-[#EEEEEE] shadow-xs px-5 py-6 sm:px-7 sm:py-7 text-center space-y-4 sm:space-y-5 my-6">
        <div className="w-11 h-11 rounded-full bg-red-50 border border-red-100 text-[#E63946] flex items-center justify-center mx-auto">
          <XCircle className="w-5 h-5" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#202124]">
            Membership request not approved
          </h1>
          <p className="text-xs sm:text-[13px] text-[#777777] leading-relaxed">
            Your IDEA LAB membership request could not be approved at this time. Contact the faculty coordinator if you need your application reviewed again.
          </p>
        </div>

        <div className="rounded-xl bg-[#FAF8F5] border border-[#EEEEEE] px-3.5 py-2.5 space-y-1.5 text-xs text-left">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-[#202124] truncate min-w-0">
              {studentProfile.email || user.email}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#E63946] border border-red-200 text-[11px] font-semibold shrink-0">
              Rejected
            </span>
          </div>
          {studentProfile.rejectionReason && (
            <p className="text-[11px] text-[#777777] pt-1.5 border-t border-[#EEEEEE] leading-relaxed">
              {studentProfile.rejectionReason}
            </p>
          )}
        </div>

        <div className="space-y-2.5">
          <a
            href={`mailto:idealab@saveetha.ac.in?subject=${encodeURIComponent(
              `IDEA LAB Membership Review - ${studentProfile.registrationNumber}`
            )}`}
            className="w-full h-10.5 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Coordinator</span>
          </a>

          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full h-10 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#202124] border border-[#EEEEEE] text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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

      <p className="text-[11px] text-[#777777]">
        Saveetha Engineering College • IDEA LAB
      </p>
    </div>
  );
};
