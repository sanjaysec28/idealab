import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  CalendarDays,
  ChevronDown,
  Compass,
  FolderKanban,
  Home,
  Lightbulb,
  LogOut,
  Settings,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SafeMediaImage } from './SafeMediaImage';
import { IdeaLabLogo } from '../shared/IdeaLabLogo';
import { resolveProfileAvatarUrl } from '../../utils/assets';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DESKTOP_NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '/home', icon: Home },
  { label: 'Discover', to: '/discover', icon: Compass },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Ideas', to: '/ideas', icon: Lightbulb },
  { label: 'Community', to: '/community', icon: Users },
  { label: 'Events', to: '/events', icon: Calendar },
  { label: 'Leaderboard', to: '/leaderboard', icon: Trophy },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'IL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const HomeHeader: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    studentProfile,
    studentAvailability,
    hasCompletedTimetable,
    studentData,
    signOut,
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [dismissedNotifs, setDismissedNotifs] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = studentProfile?.fullName || user?.displayName || studentData.name;
  const displayEmail = studentProfile?.email || user?.email || studentData.email;
  const displayDept = studentProfile?.department || studentData.department;
  const displayYear =
    studentProfile?.currentAcademicYear || studentProfile?.academicYear || studentData.year;
  const subtitle = `${displayDept} • ${displayYear}`;
  const resolvedAvatarUrl = resolveProfileAvatarUrl({
    photoURL: studentProfile?.photoURL || user?.photoURL,
    avatarPresetId: studentProfile?.avatarPresetId,
  });

  const realNotifications: { id: string; title: string; message: string; to: string }[] = [];
  if (!hasCompletedTimetable) {
    realNotifications.push({
      id: 'notif-timetable',
      title: 'Complete Your Semester Timetable',
      message: 'Submit your class timetable to calculate your free slots for IDEA LAB collaboration.',
      to: '/timetable',
    });
  } else if (!studentAvailability?.isOptedIn) {
    realNotifications.push({
      id: 'notif-availability',
      title: 'Collaboration Availability is Off',
      message: 'Turn on Smart Availability when you want verified peers to see your free periods.',
      to: '/home',
    });
  }

  const hasUnreadNotifs = !dismissedNotifs && realNotifications.length > 0;

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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[68px] flex items-center justify-between gap-3 sm:gap-4">
        {/* LEFT: IDEA LAB Brand */}
        <Link to="/home" aria-label="IDEA LAB Home" className="flex items-center shrink-0">
          <IdeaLabLogo variant="header" />
        </Link>

        {/* CENTER: Horizontal Desktop Navigation */}
        <nav aria-label="Primary Navigation" className="hidden lg:flex items-center gap-1 xl:gap-1.5">
          {DESKTOP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 xl:px-3.5 py-2 rounded-xl text-[13px] flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#FFF0F1] text-[#E63946] font-bold'
                      : 'text-[#555555] hover:text-[#202124] hover:bg-[#FAF8F5] font-medium'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* RIGHT: Notifications + Student Profile Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications((prev) => !prev);
                setShowProfileMenu(false);
                setDismissedNotifs(true);
              }}
              aria-label="Open notifications"
              aria-expanded={showNotifications}
              className="w-10 h-10 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#EAE6E1] flex items-center justify-center text-[#555555] hover:text-[#202124] transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadNotifs && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#E63946] ring-2 ring-[#FAF8F5]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-76 sm:w-80 bg-white rounded-2xl shadow-xl border border-[#EAE6E1] p-4 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAE6E1] pb-2.5">
                  <span className="text-xs font-bold text-[#202124]">Notifications</span>
                  <span className="text-[11px] font-medium text-[#777777]">
                    {realNotifications.length === 0 ? 'All caught up' : `${realNotifications.length} update`}
                  </span>
                </div>
                {realNotifications.length === 0 ? (
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] text-center">
                    <p className="text-xs font-semibold text-[#202124]">No new notifications</p>
                    <p className="text-[11px] text-[#777777] mt-0.5">
                      Real campus updates and collaboration notices will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    {realNotifications.map((notif) => (
                      <Link
                        key={notif.id}
                        to={notif.to}
                        onClick={() => setShowNotifications(false)}
                        className="block p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#EAE6E1] transition-colors"
                      >
                        <p className="font-semibold text-[#202124]">{notif.title}</p>
                        <p className="text-[11px] text-[#777777] mt-0.5">{notif.message}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Authenticated Student Profile Pill */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu((prev) => !prev);
                setShowNotifications(false);
              }}
              aria-expanded={showProfileMenu}
              aria-label="Student account menu"
              className="flex items-center gap-2 sm:gap-2.5 pl-1.5 pr-2.5 sm:pr-3 py-1 rounded-2xl bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#EAE6E1] transition-colors cursor-pointer"
            >
              {resolvedAvatarUrl ? (
                <SafeMediaImage
                  src={resolvedAvatarUrl}
                  alt={displayName}
                  variant="avatar"
                  fallbackInitials={getInitials(displayName)}
                  className="w-8 h-8 rounded-xl object-cover border border-[#EAE6E1] shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-[#FFF0F1] border border-[#E63946]/25 text-[#E63946] font-bold text-xs flex items-center justify-center shrink-0">
                  {getInitials(displayName)}
                </div>
              )}

              <div className="hidden md:block text-left max-w-[170px]">
                <p className="text-xs font-bold text-[#202124] leading-tight truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-[#777777] leading-tight mt-0.5 truncate">
                  {subtitle}
                </p>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-[#777777] transition-transform shrink-0 ${
                  showProfileMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EAE6E1] p-2 z-50">
                <div className="px-3 py-2.5 border-b border-[#EAE6E1]">
                  <p className="text-xs font-bold text-[#202124] truncate">{displayName}</p>
                  <p className="text-[11px] text-[#777777] truncate mt-0.5">{displayEmail}</p>
                  <p className="text-[10px] text-[#777777] truncate mt-0.5">{subtitle}</p>
                </div>

                <div className="py-1.5 space-y-0.5">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-[#202124] hover:bg-[#FAF8F5] flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-[#777777]" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/timetable"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-[#202124] hover:bg-[#FAF8F5] flex items-center gap-2"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-[#777777]" />
                    <span>Timetable Builder</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-3 py-2 rounded-xl text-left text-xs font-medium text-[#202124] hover:bg-[#FAF8F5] flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#777777]" />
                    <span>Settings</span>
                  </Link>
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
    </header>
  );
};
