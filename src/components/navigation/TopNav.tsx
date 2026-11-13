import React, { useState } from 'react';
import { Search, Bell, Sparkles, X } from 'lucide-react';
import { Logo } from './Logo';
import { ASSETS } from '../../utils/assets';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface TopNavProps {
  onOpenCreateIdea?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenCreateIdea }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { studentData } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[#EEEEEE] px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
      {/* Mobile Logo */}
      <div className="flex items-center lg:hidden">
        <Link to="/discover">
          <Logo size="sm" />
        </Link>
      </div>

      {/* Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md relative">
        <Search className="absolute left-3.5 w-4 h-4 text-[#777777]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects, members, events & ideas..."
          className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl pl-10 pr-4 py-2 text-sm text-[#202124] placeholder-[#777777] focus:outline-none focus:border-[#E63946] focus:bg-white transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 ml-auto">
        {onOpenCreateIdea && (
          <button
            onClick={onOpenCreateIdea}
            className="hidden sm:flex items-center gap-2 bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-[#E63946]/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Submit Idea</span>
          </button>
        )}

        {/* Notifications button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#EEEEEE] flex items-center justify-center text-[#777777] hover:text-[#202124] hover:bg-white transition-all relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#E63946] rounded-full" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#EEEEEE] p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#EEEEEE]">
                <h4 className="font-semibold text-sm text-[#202124]">Campus Notifications</h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[#777777] hover:text-[#202124]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="divide-y divide-[#EEEEEE] max-h-72 overflow-y-auto">
                <div className="py-3">
                  <p className="text-xs font-medium text-[#202124]">New Workshop Announced!</p>
                  <p className="text-[11px] text-[#777777] mt-0.5">Generative AI masterclass registration is now open.</p>
                  <span className="text-[10px] text-[#E63946] font-medium mt-1 inline-block">2 hours ago</span>
                </div>
                <div className="py-3">
                  <p className="text-xs font-medium text-[#202124]">Project Milestone Reached</p>
                  <p className="text-[11px] text-[#777777] mt-0.5">Your project CampusAI crossed 140 likes!</p>
                  <span className="text-[10px] text-[#E63946] font-medium mt-1 inline-block">1 day ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <Link to="/profile" className="flex items-center gap-2 pl-2 border-l border-[#EEEEEE]">
          <img
            src={ASSETS.students[0]}
            alt="Profile"
            className="w-10 h-10 rounded-xl object-cover border-2 border-[#E63946]/30 shadow-sm"
          />
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-[#202124]">{studentData.name}</p>
            <p className="text-[10px] text-[#777777]">
              {studentData.department} • {studentData.year}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
};
