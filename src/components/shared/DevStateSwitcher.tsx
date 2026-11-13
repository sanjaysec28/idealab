import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { devCoordinatorChannel } from '../../data/mock/devCoordinatorChannel';
import { Shield, Sparkles, X, ChevronUp, CheckCircle2, Ban, ShieldAlert, Clock } from 'lucide-react';

const AUTH_PATHS = [
  '/',
  '/splash',
  '/welcome',
  '/onboarding',
  '/login',
  '/join',
  '/setup-profile',
  '/pending-approval',
  '/timetable-setup',
  '/application-rejected',
  '/account-suspended',
];

export const DevStateSwitcher: React.FC = () => {
  const { authState, user, membership, signInWithGoogle, signOut, refreshMembership } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [forceVisible, setForceVisible] = useState(false);
  const [pathname, setPathname] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    const syncPath = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', syncPath);

    const origPush = window.history.pushState.bind(window.history);
    const origReplace = window.history.replaceState.bind(window.history);
    window.history.pushState = (...args) => {
      origPush(...args);
      syncPath();
    };
    window.history.replaceState = (...args) => {
      origReplace(...args);
      syncPath();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setForceVisible((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', syncPath);
      window.removeEventListener('keydown', handleKeyDown);
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
    };
  }, []);

  if (AUTH_PATHS.includes(pathname) && !forceVisible) {
    return null;
  }

  const switchToPreset = async (
    preset: 'logged_out' | 'new_google' | 'pending' | 'approved' | 'rejected' | 'suspended'
  ) => {
    if (preset === 'logged_out') {
      await signOut();
      window.history.pushState({}, '', '/welcome');
      window.dispatchEvent(new PopStateEvent('popstate'));
      setIsOpen(false);
      return;
    }

    if (preset === 'new_google') {
      const rand = Math.floor(1000 + Math.random() * 9000);
      await signInWithGoogle({
        email: `student.${rand}@saveetha.ac.in`,
        displayName: `New Student ${rand}`,
      });
      window.history.pushState({}, '', '/pending-approval');
      window.dispatchEvent(new PopStateEvent('popstate'));
      setIsOpen(false);
      return;
    }

    const emailMap = {
      pending: { email: 'rohan.pending@saveetha.ac.in', name: 'Rohan Venkatesh', path: '/pending-approval' },
      approved: { email: 'ananya.sec2024101@saveetha.ac.in', name: 'Ananya Sharma', path: '/discover' },
      rejected: { email: 'meera.rejected@saveetha.ac.in', name: 'Meera Nair', path: '/application-rejected' },
      suspended: { email: 'vikram.suspended@saveetha.ac.in', name: 'Vikram Sundar', path: '/account-suspended' },
    }[preset];

    await signInWithGoogle({ email: emailMap.email, displayName: emailMap.name });
    window.history.pushState({}, '', emailMap.path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    setIsOpen(false);
  };

  const handleCoordinatorAction = async (action: 'approve' | 'reject' | 'suspend' | 'pending') => {
    if (!user?.uid) return;
    if (action === 'approve') devCoordinatorChannel.approveStudent(user.uid);
    if (action === 'reject') devCoordinatorChannel.rejectStudent(user.uid);
    if (action === 'suspend') devCoordinatorChannel.suspendStudent(user.uid);
    if (action === 'pending') devCoordinatorChannel.resetToPending(user.uid);
    await refreshMembership();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-[#EEEEEE] p-4 w-72 space-y-3 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EEEEEE]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#E63946]" />
              <span className="font-bold text-xs text-[#202124]">Dev Auth & Membership</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#777777] hover:text-[#202124] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-[#777777]">
              Auth state: <strong className="text-[#E63946] uppercase">{authState}</strong>
            </p>
            {membership && (
              <p className="text-[10px] text-[#777777] truncate">
                {membership.email} ({membership.requestId})
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">Switch Account Preset</p>
            {[
              { id: 'logged_out', label: 'Logged Out' },
              { id: 'new_google', label: 'New Google Student (Pending)' },
              { id: 'pending', label: 'Pending Approval (Rohan)' },
              { id: 'approved', label: 'Approved Complete (Ananya)' },
              { id: 'rejected', label: 'Rejected (Meera)' },
              { id: 'suspended', label: 'Suspended (Vikram)' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void switchToPreset(item.id as Parameters<typeof switchToPreset>[0])}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-[#FAFAFA] hover:bg-[#EEEEEE] text-[#202124] transition-all flex items-center justify-between cursor-pointer"
              >
                <span>{item.label}</span>
                <Sparkles className="w-3 h-3 text-[#E63946]" />
              </button>
            ))}
          </div>

          {user && (
            <div className="pt-2 border-t border-[#EEEEEE] space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                External Coordinator Simulator
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => void handleCoordinatorAction('approve')}
                  className="px-2.5 py-1.5 rounded-xl bg-[#32B878]/10 hover:bg-[#32B878]/20 text-[#32B878] text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Approve</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleCoordinatorAction('pending')}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3 h-3" />
                  <span>Set Pending</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleCoordinatorAction('reject')}
                  className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Ban className="w-3 h-3" />
                  <span>Reject</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleCoordinatorAction('suspend')}
                  className="px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span>Suspend</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#202124] hover:bg-black text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border border-white/20 transition-transform hover:scale-105 cursor-pointer"
        >
          <Shield className="w-4 h-4 text-[#E63946]" />
          <span>Dev: [{authState}]</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
