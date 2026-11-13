import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, FolderKanban, Plus, Users, Calendar } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenCreate: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenCreate }) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#EEEEEE] z-30 px-4 py-2 flex items-center justify-between shadow-lg">
      <NavLink
        to="/discover"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[11px] font-medium ${
            isActive ? 'text-[#E63946]' : 'text-[#777777]'
          }`
        }
      >
        <Compass className="w-5 h-5" />
        <span>Discover</span>
      </NavLink>

      <NavLink
        to="/projects"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[11px] font-medium ${
            isActive ? 'text-[#E63946]' : 'text-[#777777]'
          }`
        }
      >
        <FolderKanban className="w-5 h-5" />
        <span>Projects</span>
      </NavLink>

      {/* Central Coral Red Create Button */}
      <button
        onClick={onOpenCreate}
        className="w-12 h-12 bg-[#E63946] hover:bg-[#d62839] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#E63946]/30 -mt-5 border-4 border-white transition-transform active:scale-95 cursor-pointer"
      >
        <Plus className="w-6 h-6" />
      </button>

      <NavLink
        to="/community"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[11px] font-medium ${
            isActive ? 'text-[#E63946]' : 'text-[#777777]'
          }`
        }
      >
        <Users className="w-5 h-5" />
        <span>Community</span>
      </NavLink>

      <NavLink
        to="/events"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[11px] font-medium ${
            isActive ? 'text-[#E63946]' : 'text-[#777777]'
          }`
        }
      >
        <Calendar className="w-5 h-5" />
        <span>Events</span>
      </NavLink>
    </div>
  );
};
