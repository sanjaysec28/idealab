import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Globe, 
  FolderKanban, 
  Lightbulb, 
  Users, 
  Trophy, 
  Award, 
  Calendar, 
  User, 
  Settings,
  LogOut,
  Building2
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const navItems = [
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Explore', path: '/explore', icon: Globe },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Ideas Hub', path: '/ideas', icon: Lightbulb },
    { label: 'Community', path: '/community', icon: Users },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Achievements', path: '/achievements', icon: Award },
    { label: 'Events & Workshops', path: '/events', icon: Calendar },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome', { replace: true });
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#EEEEEE] h-screen sticky top-0 z-30">
      <div className="p-6 border-b border-[#EEEEEE] flex items-center justify-between">
        <Logo size="md" />
      </div>

      <div className="px-4 py-3 bg-[#FFF0F1] mx-4 mt-4 rounded-xl flex items-center gap-3">
        <Building2 className="w-5 h-5 text-[#E63946] shrink-0" />
        <div className="text-xs">
          <p className="font-semibold text-[#202124]">Saveetha Campus</p>
          <p className="text-[#777777]">IDEA Lab Ecosystem</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20'
                    : 'text-[#777777] hover:bg-[#FAFAFA] hover:text-[#202124]'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#EEEEEE]">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#777777] hover:bg-[#FFF0F1] hover:text-[#E63946] transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
