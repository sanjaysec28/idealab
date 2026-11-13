import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Hourglass,
  CheckCircle2,
  Circle,
  RefreshCw,
  LogOut,
  Mail,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Logo } from '../../components/navigation/Logo';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import { AuthLoadingScreen } from '../../components/auth/AuthGuard';

export const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    membership,
    authState,
    notificationRecord,
    isMembershipLoading,
    refreshMembership,
    retryCoordinatorNotification,
    signOut,
    resolveDestinationPath,
  } = useAuth();
  const { withBackgroundRefresh } = useLoading();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRetryingNotif, setIsRetryingNotif] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const intendedFrom = (location.state as { from?: string } | null)?.from;

  // Automatically transition when coordinator updates status without requiring re-login
  useEffect(() => {
    if (authState === 'loading') return;
    if (authState === 'unauthenticated' || !user) {
      navigate('/welcome', { replace: true });
      return;
    }
    if (authState === 'approved') {
      const nextRoute = resolveDestinationPath(intendedFrom);
      navigate(nextRoute, { replace: true });
      return;
    }
    if (authState === 'rejected') {
      navigate('/application-rejected', { replace: true });
      return;
    }
    if (authState === 'suspended') {
      navigate('/account-suspended', { replace: true });
    }
  }, [authState, user, intendedFrom, navigate, resolveDestinationPath]);

  if (authState === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (!user || !membership) {
    return null;
  }

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    setStatusFeedback(null);
    try {
      const updated = await withBackgroundRefresh(refreshMembership());
      if (updated?.status === 'PENDING') {
        setStatusFeedback('Status checked — your application is still under coordinator review.');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetryNotification = async () => {
    setIsRetryingNotif(true);
    try {
      await retryCoordinatorNotification({ simulateFailure: false });
    } finally {
      setIsRetryingNotif(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome', { replace: true });
  };

  const formattedRequestedAt = new Date(membership.requestedAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col justify-between p-6 lg:p-10 text-[#202124]">
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
        <Logo size="md" />
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#E63946] bg-[#FFF0F1] px-3 py-1.5 rounded-full border border-[#E63946]/20">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Approval</span>
        </span>
      </div>

      <div className="max-w-lg mx-auto w-full bg-white rounded-3xl border border-[#EEEEEE] p-7 sm:p-9 shadow-xl space-y-6 my-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#FFF0F1] text-[#E63946] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Hourglass className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-extrabold text-[#202124] leading-tight">
            Your IDEA LAB journey is almost ready!
          </h1>
          <p className="text-xs sm:text-[13px] text-[#777777] leading-relaxed">
            Your registration is successful. Our coordinators are reviewing your membership request. You'll receive access once your account is approved.
          </p>
        </div>

        {/* Request Metadata Card */}
        <div className="rounded-2xl bg-[#FAFAFA] border border-[#EEEEEE] p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#777777]">Student Name</span>
            <span className="font-bold text-[#202124] text-right">{membership.fullName}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#777777]">Registered Google Email</span>
            <span className="font-semibold text-[#202124] text-right truncate max-w-[220px]">
              {membership.email}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#777777]">Request Reference ID</span>
            <span className="font-bold text-[#E63946] font-mono">{membership.requestId}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#777777]">Submitted At</span>
            <span className="font-medium text-[#202124] text-right">{formattedRequestedAt}</span>
          </div>
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#EEEEEE]">
            <span className="text-[#777777]">Current Status</span>
            <span className="inline-flex items-center gap-1.5 font-bold text-[#E63946]">
              <span className="w-2 h-2 rounded-full bg-[#E63946] animate-pulse" />
              Pending Approval
            </span>
          </div>
        </div>

        {/* Non-blocking WhatsApp Notification Retry Banner (Scenario 9) */}
        {notificationRecord?.deliveryStatus === 'FAILED' && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-left space-y-2">
            <div className="flex items-start gap-2 text-amber-800 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p>Your membership request is safely saved, but coordinator alert delivery failed.</p>
                <p className="text-[11px] font-normal text-amber-700 mt-0.5">
                  {notificationRecord.lastError || 'WhatsApp notification could not be delivered.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRetryNotification}
              disabled={isRetryingNotif}
              className="text-[11px] font-bold text-amber-900 bg-white hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {isRetryingNotif ? 'Retrying Alert...' : 'Retry Coordinator Alert'}
            </button>
          </div>
        )}

        {/* 4-Step Progress Timeline */}
        <div className="space-y-4 text-left pt-1">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#32B878]/15 text-[#32B878] flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-[#202124]">1. Google account verified</p>
              <p className="text-[11px] text-[#32B878] font-medium">Completed</p>
            </div>
          </div>

          <div className="flex items-start gap-3 relative before:absolute before:left-3 before:-top-4 before:w-0.5 before:h-4 before:bg-[#32B878]/30">
            <div className="w-6 h-6 rounded-full bg-[#32B878]/15 text-[#32B878] flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-[#202124]">2. Membership request submitted</p>
              <p className="text-[11px] text-[#32B878] font-medium">Completed • {membership.requestId}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 relative before:absolute before:left-3 before:-top-4 before:w-0.5 before:h-4 before:bg-[#EEEEEE]">
            <div className="w-6 h-6 rounded-full bg-[#FFF0F1] border-2 border-[#E63946] flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-[#E63946]" />
            </div>
            <div>
              <p className="font-bold text-xs text-[#202124]">3. Coordinator review</p>
              <p className="text-[11px] text-[#E63946] font-medium">In progress</p>
            </div>
          </div>

          <div className="flex items-start gap-3 relative before:absolute before:left-3 before:-top-4 before:w-0.5 before:h-4 before:bg-[#EEEEEE]">
            <div className="w-6 h-6 rounded-full bg-[#FAFAFA] border-2 border-[#E0E0E0] flex items-center justify-center shrink-0 mt-0.5">
              <Circle className="w-3 h-3 text-[#AAAAAA]" />
            </div>
            <div>
              <p className="font-bold text-xs text-[#777777]">4. Student access activated</p>
              <p className="text-[11px] text-[#999999]">Waiting for coordinator approval</p>
            </div>
          </div>
        </div>

        {statusFeedback && (
          <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#EEEEEE] text-[11px] text-[#555555] text-center font-medium">
            {statusFeedback}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleRefreshStatus}
            disabled={isRefreshing || isMembershipLoading}
            className="w-full py-3.5 bg-[#E63946] hover:bg-[#d62839] text-white rounded-full text-xs font-bold shadow-md shadow-[#E63946]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking Approval Status...' : 'Refresh Status'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setShowContactInfo((prev) => !prev)}
              className="py-3 bg-white hover:bg-[#FAFAFA] text-[#202124] border border-[#EEEEEE] rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-[#777777]" />
              <span>Contact Coordinator</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="py-3 bg-white hover:bg-[#FFF0F1] text-[#777777] hover:text-[#E63946] border border-[#EEEEEE] rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {showContactInfo && (
            <div className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#EEEEEE] text-left text-[11px] text-[#555555] space-y-1">
              <p className="font-bold text-[#202124]">IDEA LAB Faculty Coordinator Desk</p>
              <p>Email: idealab@saveetha.ac.in</p>
              <p>Location: AICTE IDEA Lab, Saveetha Engineering College</p>
              <a
                href={`mailto:idealab@saveetha.ac.in?subject=${encodeURIComponent(
                  `IDEA LAB Membership Review - ${membership.requestId}`
                )}`}
                className="inline-block mt-1 font-bold text-[#E63946] hover:underline"
              >
                Send email referencing {membership.requestId} →
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full text-center text-xs text-[#777777]">
        Saveetha Engineering College • IDEA Lab
      </div>
    </div>
  );
};
