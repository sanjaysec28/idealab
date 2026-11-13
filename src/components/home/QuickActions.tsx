import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Layers,
  Lightbulb,
  PenLine,
  Users,
  Zap,
} from 'lucide-react';

interface QuickActionItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const QUICK_ACTIONS: QuickActionItem[] = [
  { label: 'Create Post', to: '/community', icon: PenLine },
  { label: 'Start a Project', to: '/projects', icon: Layers },
  { label: 'Share an Idea', to: '/ideas', icon: Lightbulb },
  { label: 'Find a Team', to: '/community', icon: Users },
  { label: 'View Timetable', to: '/timetable', icon: CalendarDays },
];

export const QuickActions: React.FC = () => {
  return (
    <section className="bg-white rounded-[22px] border border-[#EAE6E1] shadow-[0_2px_12px_rgba(32,33,36,0.03)] p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center gap-2">
        <Zap className="w-4.5 h-4.5 text-[#E63946]" />
        <h2 className="text-[15px] font-bold text-[#202124]">Quick Actions</h2>
      </div>

      <div className="flex overflow-x-auto gap-2.5 pb-1 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-5">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.to}
              className="shrink-0 sm:shrink flex items-center gap-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#FFF0F1] border border-[#EAE6E1] hover:border-[#E63946]/30 px-3.5 py-2.5 transition-colors group"
            >
              <span className="w-8 h-8 rounded-xl bg-[#FFF0F1] group-hover:bg-white text-[#E63946] flex items-center justify-center shrink-0 transition-colors">
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-[#202124] whitespace-nowrap">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
