import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Compass, FolderKanban, Users } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#EAE6E1] rounded-t-2xl z-30 px-2 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(32,33,36,0.06)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center">
        <NavLink
          to="/discover"
          className={({ isActive }) =>
            `min-h-[44px] flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#E63946]' : 'text-[#777777] hover:text-[#202124]'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span>Discover</span>
        </NavLink>

        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `min-h-[44px] flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#E63946]' : 'text-[#777777] hover:text-[#202124]'
            }`
          }
        >
          <FolderKanban className="w-5 h-5" />
          <span>Projects</span>
        </NavLink>

        <NavLink
          to="/community"
          className={({ isActive }) =>
            `min-h-[44px] flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#E63946]' : 'text-[#777777] hover:text-[#202124]'
            }`
          }
        >
          <Users className="w-5 h-5" />
          <span>Community</span>
        </NavLink>

        <NavLink
          to="/events"
          className={({ isActive }) =>
            `min-h-[44px] flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#E63946]' : 'text-[#777777] hover:text-[#202124]'
            }`
          }
        >
          <Calendar className="w-5 h-5" />
          <span>Events</span>
        </NavLink>
      </div>
    </nav>
  );
};
