import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, X, ChevronUp, RefreshCw, LogOut } from 'lucide-react';

const AUTH_PATHS = [
  '/',
  '/splash',
  '/welcome',
  '/onboarding',
  '/signup',
  '/login',
  '/join',
  '/verify-email',
  '/membership-request',
  '/setup-profile',
  '/pending-approval',
  '/membership-rejected',
  '/application-rejected',
  '/account-suspended',
  '/timetable-setup',
];

export const DevStateSwitcher: React.FC = () => {
  const { authState, user, studentProfile, refreshMembership, signOut } = useAuth();
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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-2xl shadow-xl border border-[#EEEEEE] p-4 w-64 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EEEEEE]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#E63946]" />
              <span className="font-bold text-xs text-[#202124]">Firebase Session</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#777777] hover:text-[#202124] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1 text-[11px] text-[#777777]">
            <p>
              Status: <strong className="text-[#E63946] uppercase">{authState}</strong>
            </p>
            {user?.email && <p className="truncate">{user.email}</p>}
            {studentProfile?.registrationNumber && (
              <p>Reg: {studentProfile.registrationNumber}</p>
            )}
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={() => void refreshMembership()}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EEEEEE] text-[#202124] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Firestore Status</span>
            </button>
            {user && (
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#FFF0F1] hover:bg-red-100 text-[#E63946] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#202124] hover:bg-black text-white px-3.5 py-2 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border border-white/15 cursor-pointer"
        >
          <Shield className="w-3.5 h-3.5 text-[#E63946]" />
          <span>Auth: {authState}</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
