import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Flame, Trophy } from 'lucide-react';
import {
  ApprovedLeaderboardEntry,
  subscribeToApprovedLeaderboard,
} from '../../services/homeDataService';
import { SafeMediaImage } from './SafeMediaImage';

function getRankBadgeClass(rank: number): string {
  if (rank === 1) return 'bg-[#F59E0B] text-white shadow-xs';
  if (rank === 2) return 'bg-[#CBD5E1] text-[#334155]';
  if (rank === 3) return 'bg-[#D97706] text-white';
  return 'bg-[#FAF8F5] text-[#555555] border border-[#EAE6E1]';
}

export const LeaderboardCard: React.FC = () => {
  const [entries, setEntries] = useState<ApprovedLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const unsubscribe = subscribeToApprovedLeaderboard(
      (items) => {
        setEntries(items.slice(0, 3));
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || 'Unable to load leaderboard.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <section className="bg-white rounded-[22px] border border-[#EAE6E1] shadow-[0_2px_12px_rgba(32,33,36,0.03)] p-5 space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Trophy className="w-4.5 h-4.5 text-[#E63946] shrink-0" />
          <h2 className="text-[15px] font-bold text-[#202124] truncate">
            Leaderboard{' '}
            <span className="text-xs font-medium text-[#777777]">(Approved)</span>
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

      {error ? (
        <div
          role="alert"
          className="rounded-2xl bg-[#FFF0F1] border border-[#E63946]/25 p-3.5 flex items-start gap-2 text-xs text-[#E63946]"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="text-[11px]">{error}</span>
        </div>
      ) : isLoading ? (
        <div className="space-y-2.5 animate-pulse" aria-busy="true">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="h-14 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1]"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4 text-center space-y-1.5">
          <p className="text-xs font-bold text-[#202124]">No leaderboard rankings yet</p>
          <p className="text-[11px] text-[#777777]">
            Coordinator-approved student contribution points will appear here once awarded.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5" aria-label="Verified monthly contributor leaderboard">
          {entries.map((entry) => {
            const subtitle = [entry.academicYear, entry.department]
              .filter(Boolean)
              .join(' · ');

            return (
              <Link
                key={entry.uid}
                to="/leaderboard"
                className="flex items-center justify-between gap-3 rounded-2xl bg-[#FAF8F5]/70 hover:bg-[#FAF8F5] border border-[#EAE6E1]/80 px-3 py-2.5 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full text-[11px] font-extrabold flex items-center justify-center shrink-0 tabular-nums ${getRankBadgeClass(
                      entry.rank
                    )}`}
                  >
                    {entry.rank}
                  </span>

                  <SafeMediaImage
                    src={entry.avatar}
                    alt={entry.fullName}
                    variant="avatar"
                    lazy
                    className="w-9 h-9 rounded-full object-cover border border-[#EAE6E1] shrink-0 text-[11px]"
                  />

                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#202124] truncate">
                      {entry.fullName}
                    </p>
                    <p className="text-[11px] text-[#777777] truncate">{subtitle}</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 text-[13px] font-extrabold text-[#202124] shrink-0 tabular-nums">
                  <Flame className="w-4 h-4 text-[#E63946] fill-[#E63946]" />
                  <span>{entry.approvedPoints}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};
