import React from 'react';
import { ACHIEVEMENTS } from '../../data/achievements';
import { Award, Rocket, Users, Trophy, Lightbulb, BookOpen, CheckCircle, Lock } from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Rocket': return Rocket;
      case 'Users': return Users;
      case 'Trophy': return Trophy;
      case 'Lightbulb': return Lightbulb;
      case 'BookOpen': return BookOpen;
      default: return Award;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-[#202124]">Badges & Achievements</h1>
        <p className="text-xs text-[#777777] mt-1">Unlock milestone badges by building projects, attending workshops, and collaborating.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ACHIEVEMENTS.map((ach) => {
          const Icon = getIcon(ach.iconName);
          return (
            <div
              key={ach.id}
              className={`rounded-3xl border p-6 flex items-start gap-4 transition-all ${
                ach.isUnlocked
                  ? 'bg-white border-[#EEEEEE] shadow-sm'
                  : 'bg-[#FAFAFA] border-[#EEEEEE] opacity-75'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  ach.isUnlocked ? 'bg-[#FFF0F1] text-[#E63946]' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {ach.isUnlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">{ach.category}</span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${ach.isUnlocked ? 'bg-[#32B878]/10 text-[#32B878]' : 'bg-gray-200 text-gray-600'}`}>
                    +{ach.points} pts
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#202124]">{ach.title}</h3>
                <p className="text-xs text-[#777777] leading-relaxed">{ach.description}</p>
                {ach.isUnlocked && (
                  <p className="text-[10px] font-semibold text-[#32B878] pt-1 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Unlocked on {ach.unlockedAt}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
