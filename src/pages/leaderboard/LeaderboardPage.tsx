import React from 'react';
import { LEADERBOARD } from '../../data/leaderboard';
import { Trophy, Award, Star } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-[#202124]">Campus Innovator Leaderboard</h1>
        <p className="text-xs text-[#777777] mt-1">Ranking top student makers and contributors across Saveetha Engineering College.</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 pt-4">
        {LEADERBOARD.slice(0, 3).map((entry, index) => {
          const podiumHeights = ['h-40 bg-amber-50 border-amber-200', 'h-32 bg-gray-50 border-gray-200', 'h-28 bg-orange-50 border-orange-200'];
          const rankColors = ['text-amber-500', 'text-gray-400', 'text-amber-700'];
          const orderClasses = ['order-2', 'order-1', 'order-3'];

          return (
            <div key={entry.memberId} className={`flex flex-col items-center ${orderClasses[index]}`}>
              <div className="relative mb-2">
                <img src={entry.avatar} alt={entry.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" />
                <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white font-extrabold text-xs flex items-center justify-center shadow border ${rankColors[index]}`}>
                  #{entry.rank}
                </span>
              </div>
              <p className="font-bold text-xs text-[#202124] text-center line-clamp-1">{entry.name}</p>
              <p className="text-[10px] text-[#777777] mb-2">{entry.points} pts</p>

              <div className={`w-full rounded-2xl border flex flex-col items-center justify-center p-3 ${podiumHeights[index]}`}>
                <Trophy className={`w-6 h-6 ${rankColors[index]}`} />
                <span className="text-[10px] font-bold text-[#202124] mt-1">{entry.badge}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard List */}
      <div className="bg-white rounded-3xl border border-[#EEEEEE] overflow-hidden shadow-sm">
        <div className="p-4 bg-[#FAFAFA] border-b border-[#EEEEEE] grid grid-cols-12 text-xs font-semibold text-[#777777] uppercase tracking-wider">
          <span className="col-span-2 text-center">Rank</span>
          <span className="col-span-6">Student Innovator</span>
          <span className="col-span-2 text-center">Projects</span>
          <span className="col-span-2 text-right pr-4">Points</span>
        </div>

        <div className="divide-y divide-[#EEEEEE]">
          {LEADERBOARD.map((entry) => (
            <div key={entry.memberId} className="grid grid-cols-12 items-center p-4 hover:bg-[#FAFAFA] transition-colors">
              <div className="col-span-2 flex items-center justify-center font-extrabold text-sm text-[#202124]">
                #{entry.rank}
              </div>
              <div className="col-span-6 flex items-center gap-3">
                <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <h4 className="font-bold text-xs text-[#202124]">{entry.name}</h4>
                  <p className="text-[10px] text-[#777777]">{entry.department}</p>
                </div>
              </div>
              <div className="col-span-2 text-center text-xs font-semibold text-[#202124]">
                {entry.projectsCompleted}
              </div>
              <div className="col-span-2 text-right pr-4">
                <span className="inline-block px-3 py-1 bg-[#FFF0F1] text-[#E63946] text-xs font-extrabold rounded-xl">
                  {entry.points} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
