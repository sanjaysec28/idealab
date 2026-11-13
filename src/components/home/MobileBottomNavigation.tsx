import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Home, User, Users } from 'lucide-react';

export const MobileBottomNavigation: React.FC = () => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE6E1] rounded-t-2xl px-2 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(32,33,36,0.06)]"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `min-h-[44px] flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#E63946]' : 'text-[#777777] hover:text-[#202124]'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `min-h-[44px] flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#E63946]' : 'text-[#777777] hover:text-[#202124]'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span>Explore</span>
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
          to="/profile"
          className={({ isActive }) =>
            `min-h-[44px] flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#E63946]' : 'text-[#777777] hover:text-[#202124]'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};
