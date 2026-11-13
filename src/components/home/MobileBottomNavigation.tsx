import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  CalendarDays,
  Compass,
  Home,
  Layers,
  Lightbulb,
  PenLine,
  Plus,
  User,
  Users,
  X,
} from 'lucide-react';

export const MobileBottomNavigation: React.FC = () => {
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  return (
    <>
      {showCreateSheet && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] flex items-end justify-center p-4 pb-24"
          onClick={() => setShowCreateSheet(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl border border-[#EAE6E1] shadow-2xl p-4 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-1 pb-2 border-b border-[#EAE6E1]">
              <span className="text-sm font-bold text-[#202124]">Quick Create</span>
              <button
                type="button"
                onClick={() => setShowCreateSheet(false)}
                aria-label="Close create menu"
                className="w-7 h-7 rounded-lg bg-[#FAF8F5] text-[#555555] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/community"
              onClick={() => setShowCreateSheet(false)}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#FAF8F5] transition-colors"
            >
              <span className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                <PenLine className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#202124]">Create Post</p>
                <p className="text-[11px] text-[#777777]">Share an update or find teammates</p>
              </div>
            </Link>

            <Link
              to="/projects"
              onClick={() => setShowCreateSheet(false)}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#FAF8F5] transition-colors"
            >
              <span className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#202124]">Start a Project</p>
                <p className="text-[11px] text-[#777777]">Publish your campus build</p>
              </div>
            </Link>

            <Link
              to="/ideas"
              onClick={() => setShowCreateSheet(false)}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#FAF8F5] transition-colors"
            >
              <span className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#202124]">Share an Idea</p>
                <p className="text-[11px] text-[#777777]">Pitch a problem statement</p>
              </div>
            </Link>

            <Link
              to="/timetable"
              onClick={() => setShowCreateSheet(false)}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#FAF8F5] transition-colors"
            >
              <span className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-[#202124]">View Timetable</p>
                <p className="text-[11px] text-[#777777]">Update your free class slots</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE6E1] px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(32,33,36,0.06)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-end">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 text-[11px] font-semibold ${
                isActive ? 'text-[#E63946]' : 'text-[#777777]'
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 text-[11px] font-semibold ${
                isActive ? 'text-[#E63946]' : 'text-[#777777]'
              }`
            }
          >
            <Compass className="w-5 h-5" />
            <span>Explore</span>
          </NavLink>

          <div className="flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setShowCreateSheet((prev) => !prev)}
              aria-label="Create new item"
              aria-expanded={showCreateSheet}
              className="w-12 h-12 -mt-6 rounded-full bg-[#E63946] hover:bg-[#D62839] text-white flex items-center justify-center shadow-lg shadow-[#E63946]/30 border-4 border-white active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className={`w-6 h-6 transition-transform ${showCreateSheet ? 'rotate-45' : ''}`} />
            </button>
            <span className="text-[10px] font-semibold text-[#777777] mt-0.5">Create</span>
          </div>

          <NavLink
            to="/community"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 text-[11px] font-semibold ${
                isActive ? 'text-[#E63946]' : 'text-[#777777]'
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span>Community</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 text-[11px] font-semibold ${
                isActive ? 'text-[#E63946]' : 'text-[#777777]'
              }`
            }
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </NavLink>
        </div>
      </nav>
    </>
  );
};
