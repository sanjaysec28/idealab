import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Mail, LogOut, ArrowLeft, RefreshCw } from 'lucide-react';
import { Logo } from '../../components/navigation/Logo';
import { useAuth } from '../../context/AuthContext';
import { AuthLoadingScreen } from '../../components/auth/AuthGuard';

export const AccountSuspendedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, membership, authState, refreshMembership, signOut, resolveDestinationPath } = useAuth();

  useEffect(() => {
    if (authState === 'loading') return;
    if (authState === 'unauthenticated' || !user) {
      navigate('/welcome', { replace: true });
      return;
    }
    if (authState === 'approved') {
      navigate(resolveDestinationPath(), { replace: true });
      return;
    }
    if (authState === 'pending') {
      navigate('/pending-approval', { replace: true });
      return;
    }
    if (authState === 'rejected') {
      navigate('/application-rejected', { replace: true });
    }
  }, [authState, user, navigate, resolveDestinationPath]);

  if (authState === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (!user || !membership) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col justify-between p-6 lg:p-10 text-[#202124]">
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
        <Logo size="md" />
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
          Account Suspended
        </span>
      </div>

      <div className="max-w-lg mx-auto w-full bg-white rounded-3xl border border-[#EEEEEE] p-7 sm:p-9 shadow-xl space-y-6 my-6 text-center">
        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#202124]">
            Your IDEA LAB Access Is Suspended
          </h1>
          <p className="text-xs sm:text-[13px] text-[#777777] leading-relaxed">
            Your student membership has been temporarily placed on hold by a faculty coordinator. Protected student features are unavailable until access is restored.
          </p>
        </div>

        <div className="rounded-2xl bg-[#FAFAFA] border border-[#EEEEEE] p-4 space-y-2 text-xs text-left">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#777777]">Member</span>
            <span className="font-bold text-[#202124]">{membership.fullName}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#777777]">Email</span>
            <span className="font-medium text-[#202124] truncate max-w-[220px]">{membership.email}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#777777]">Membership ID</span>
            <span className="font-mono font-bold text-[#E63946]">{membership.requestId}</span>
          </div>
          {membership.suspensionReason && (
            <div className="pt-2 border-t border-[#EEEEEE] space-y-1">
              <p className="text-[11px] font-bold text-[#202124]">Reason Provided</p>
              <p className="text-[11px] text-[#555555] leading-relaxed">{membership.suspensionReason}</p>
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          <a
            href={`mailto:idealab@saveetha.ac.in?subject=${encodeURIComponent(
              `IDEA LAB Account Suspension Review - ${membership.requestId}`
            )}`}
            className="w-full py-3.5 bg-[#E63946] hover:bg-[#d62839] text-white rounded-full text-xs font-bold shadow-md shadow-[#E63946]/20 transition-all flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Contact IDEA Lab Coordinator</span>
          </a>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => void refreshMembership()}
              className="py-3 bg-white hover:bg-[#FAFAFA] text-[#202124] border border-[#EEEEEE] rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#777777]" />
              <span>Re-check Status</span>
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

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#777777] hover:text-[#202124] pt-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Welcome</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full text-center text-xs text-[#777777]">
        Saveetha Engineering College • IDEA Lab
      </div>
    </div>
  );
};
