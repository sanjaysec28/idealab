import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Sparkles, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { IS_TIMETABLE_TESTING_MODE } from '../../config/featureFlags';

interface TimetableHeaderProps {
  isDemoData: boolean;
  isSubmitted: boolean;
  onClearAll: () => void;
  onRestoreDemo: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'IL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const TimetableHeader: React.FC<TimetableHeaderProps> = ({
  isDemoData,
  isSubmitted,
  onClearAll,
  onRestoreDemo,
}) => {
  const navigate = useNavigate();
  const { user, studentProfile, studentData, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = studentProfile?.fullName || user?.displayName || studentData.name;
  const displayEmail = studentProfile?.email || user?.email || studentData.email;
  const academicSubtitle = studentProfile
    ? `${studentProfile.department} • ${studentProfile.academicYear}`
    : displayEmail || 'Verified Student';

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSignOut = async () => {
    setShowProfileMenu(false);
    await signOut();
    navigate('/welcome', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EAE6E1]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* LEFT: IDEA LAB Brand + Vertical Separator + Page Title */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#E63946] text-white shadow-sm shadow-[#E63946]/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-base leading-none text-[#202124]">
                IDEA <span className="text-[#E63946]">LAB</span>
              </span>
              <span className="mt-1 text-[10px] font-semibold tracking-wider uppercase text-[#777777]">
                Saveetha Engineering College
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-[#EAE6E1] shrink-0" />

          <div className="hidden sm:block min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-bold tracking-tight text-[#202124] truncate">
                Timetable Builder
              </h1>
              {IS_TIMETABLE_TESTING_MODE && (
                <span className="px-2 py-0.5 rounded-full bg-[#FFF0F1] border border-[#E63946]/20 text-[10px] font-semibold text-[#E63946] shrink-0">
                  Testing Mode
                </span>
              )}
            </div>
            <p className="text-xs text-[#777777] truncate">
              Create and manage your class timetable for this semester.
            </p>
          </div>
        </div>

        {/* RIGHT: Notification Bell + Authenticated Student Profile Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Notification Button */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications((prev) => !prev);
                setShowProfileMenu(false);
              }}
              aria-label="Timetable notifications"
              className="w-10 h-10 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F1EC] border border-[#EAE6E1] flex items-center justify-center text-[#777777] hover:text-[#202124] transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#E63946] ring-2 ring-[#FAF8F5]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-76 bg-white rounded-2xl shadow-xl border border-[#EAE6E1] p-4 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAE6E1] pb-2.5">
                  <span className="text-xs font-bold text-[#202124]">Timetable Updates</span>
                  <span className="text-[10px] font-semibold text-[#E63946] bg-[#FFF0F1] px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1]">
                    <p className="font-semibold text-[#202124]">Email Verified</p>
                    <p className="text-[11px] text-[#777777] mt-0.5">
                      Signed in as {displayEmail}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1]">
                    <p className="font-semibold text-[#202124]">
                      {isSubmitted
                        ? 'Test Submission Saved'
                        : isDemoData
                        ? 'Sample Timetable Loaded'
                        : 'Draft Saved Locally'}
                    </p>
                    <p className="text-[11px] text-[#777777] mt-0.5">
                      {isSubmitted
                        ? 'Your semester timetable test submission is recorded for this session.'
                        : isDemoData
                        ? 'Edit sample classes or clear demo data to start from a blank grid.'
                        : 'Add classes on the left panel or click any + period in the grid.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student Profile Pill */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu((prev) => !prev);
                setShowNotifications(false);
              }}
              aria-expanded={showProfileMenu}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F5F1EC] border border-[#EAE6E1] transition-colors cursor-pointer"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-xl object-cover border border-[#EAE6E1]"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-[#FFF0F1] border border-[#E63946]/25 text-[#E63946] font-bold text-xs flex items-center justify-center shrink-0">
                  {getInitials(displayName)}
                </div>
              )}

              <div className="hidden md:block text-left max-w-[190px]">
                <p className="text-xs font-bold text-[#202124] leading-tight truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-[#777777] leading-tight mt-0.5 truncate">
                  {academicSubtitle}
                </p>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-[#777777] transition-transform ${
                  showProfileMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-68 bg-white rounded-2xl shadow-xl border border-[#EAE6E1] p-2 z-50">
                <div className="px-3 py-2.5 border-b border-[#EAE6E1]">
                  <p className="text-xs font-bold text-[#202124] truncate">{displayName}</p>
                  <p className="text-[11px] text-[#777777] truncate mt-0.5">{displayEmail}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#1F7A4D] bg-[#32B878]/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified Account</span>
                  </div>
                </div>

                <div className="py-1.5 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      onRestoreDemo();
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-[#202124] hover:bg-[#FAF8F5] flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#777777]" />
                    <span>Load Sample Timetable</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-[#202124] hover:bg-[#FAF8F5] flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#777777]" />
                    <span>Clear Timetable (Start Blank)</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#EAE6E1]">
                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-[#E63946] hover:bg-[#FFF0F1] flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile compact title strip */}
      <div className="sm:hidden px-4 pb-3 pt-1 flex items-center justify-between gap-2 border-t border-[#EAE6E1]/60 bg-[#FAF8F5]/60">
        <div>
          <h1 className="text-sm font-bold text-[#202124]">Timetable Builder</h1>
          <p className="text-[11px] text-[#777777]">
            Create and manage your semester schedule
          </p>
        </div>
        {IS_TIMETABLE_TESTING_MODE && (
          <span className="px-2 py-0.5 rounded-full bg-[#FFF0F1] border border-[#E63946]/20 text-[10px] font-semibold text-[#E63946] shrink-0">
            Testing Mode
          </span>
        )}
      </div>
    </header>
  );
};
