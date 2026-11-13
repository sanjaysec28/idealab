import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Trophy } from 'lucide-react';
import { HOME_DEMO_LEADERBOARD } from '../../data/homeDemoData';
import { SafeMediaImage } from './SafeMediaImage';

const RANK_BADGE_STYLES: Record<1 | 2 | 3, string> = {
  1: 'bg-[#F59E0B] text-white shadow-xs',
  2: 'bg-[#CBD5E1] text-[#334155]',
  3: 'bg-[#D97706] text-white',
};

export const LeaderboardCard: React.FC = () => {
  return (
    <section className="bg-white rounded-[22px] border border-[#EAE6E1] shadow-[0_2px_12px_rgba(32,33,36,0.03)] p-5 space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Trophy className="w-4.5 h-4.5 text-[#E63946] shrink-0" />
          <h2 className="text-[15px] font-bold text-[#202124] truncate">
            Leaderboard{' '}
            <span className="text-xs font-medium text-[#777777]">(This Month)</span>
          </h2>
        </div>

        <Link
          to="/leaderboard"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#E63946] hover:underline shrink-0"
        >
          <span>See All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5" aria-label="Sample monthly contributor leaderboard">
        {HOME_DEMO_LEADERBOARD.map((entry) => (
          <Link
            key={entry.rank}
            to="/leaderboard"
            className="flex items-center justify-between gap-3 rounded-2xl bg-[#FAF8F5]/70 hover:bg-[#FAF8F5] border border-[#EAE6E1]/80 px-3 py-2.5 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-6 h-6 rounded-full text-[11px] font-extrabold flex items-center justify-center shrink-0 tabular-nums ${
                  RANK_BADGE_STYLES[entry.rank]
                }`}
              >
                {entry.rank}
              </span>

              <SafeMediaImage
                src={entry.avatar}
                alt={entry.name}
                variant="avatar"
                lazy
                className="w-9 h-9 rounded-full object-cover border border-[#EAE6E1] shrink-0 text-[11px]"
              />

              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[#202124] truncate">{entry.name}</p>
                <p className="text-[11px] text-[#777777] truncate">{entry.subtitle}</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 text-[13px] font-extrabold text-[#202124] shrink-0 tabular-nums">
              <Flame className="w-4 h-4 text-[#E63946] fill-[#E63946]" />
              <span>{entry.points}</span>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-[10.5px] text-[#777777] text-right">
        Sample preview rankings
      </p>
    </section>
  );
};
