import React from 'react';
import { ArrowRight, Calendar, CalendarSearch, Users } from 'lucide-react';
import { ASSETS } from '../../utils/assets';
import { SafeMediaImage } from './SafeMediaImage';

interface SmartAvailabilityHeroProps {
  availableStudentsCount: number;
  yourFreePeriodsCount: number;
  hasValidTimetable: boolean;
  onExploreAvailableStudents: () => void;
  onFindCommonFreeSlot: () => void;
}

export const SmartAvailabilityHero: React.FC<SmartAvailabilityHeroProps> = ({
  availableStudentsCount,
  yourFreePeriodsCount,
  hasValidTimetable,
  onExploreAvailableStudents,
  onFindCommonFreeSlot,
}) => {
  return (
    <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_2px_14px_rgba(32,33,36,0.03)] overflow-hidden relative">
      <div className="grid grid-cols-1 md:grid-cols-[1.08fr_0.92fr] items-stretch">
        {/* Mobile Illustration Crop */}
        <div className="md:hidden relative h-48 sm:h-56 overflow-hidden bg-[#FAF8F5]">
          <SafeMediaImage
            src={ASSETS.home.heroMobile}
            alt="IDEA LAB students collaborating on campus"
            fallbackLabel="IDEA LAB Campus Collaboration"
            className="w-full h-full object-cover object-[52%_38%]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white via-white/75 to-transparent" />
        </div>

        {/* Left Content Column */}
        <div className="p-5 sm:p-7 lg:p-8 flex flex-col justify-center relative z-10">
          {/* Status Indicator Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#EAE6E1] w-fit">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shrink-0" />
            <span className="text-xs font-semibold text-[#202124]">Smart Availability</span>
          </div>

          {/* Headline */}
          <h1 className="mt-3.5 text-2xl sm:text-[32px] lg:text-[34px] font-extrabold tracking-tight leading-[1.15] text-[#202124] text-balance">
            Who’s free to{' '}
            <span className="text-[#E63946]">collaborate</span> today?
          </h1>

          {/* Supporting Copy */}
          <p className="mt-2.5 text-xs sm:text-sm text-[#5F6368] leading-relaxed max-w-[390px]">
            Find teammates, share ideas and build something amazing together.
          </p>

          {/* Two Statistic Cards */}
          <div className="grid grid-cols-2 gap-3 mt-5 max-w-[420px]">
            <div
              title="Opted-in students with free periods currently live"
              className="bg-[#FAF8F5] border border-[#EAE6E1] rounded-2xl px-3.5 sm:px-4 py-3 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-extrabold text-[#E63946] leading-none tabular-nums">
                  {availableStudentsCount}
                </p>
                <p className="text-[11px] font-semibold text-[#202124] mt-1 truncate">
                  Students Available
                </p>
              </div>
            </div>

            <div className="bg-[#FAF8F5] border border-[#EAE6E1] rounded-2xl px-3.5 sm:px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-extrabold text-[#E63946] leading-none tabular-nums">
                  {hasValidTimetable ? yourFreePeriodsCount : 0}
                </p>
                <p className="text-[11px] font-semibold text-[#202124] mt-1 truncate">
                  Your Free Periods
                </p>
              </div>
            </div>
          </div>

          {/* Primary & Secondary Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 mt-5">
            <button
              type="button"
              onClick={onExploreAvailableStudents}
              className="px-5 py-3 rounded-xl bg-[#E63946] hover:bg-[#D62839] active:scale-[0.99] text-white text-xs sm:text-[13px] font-semibold shadow-md shadow-[#E63946]/25 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Explore Available Students</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={onFindCommonFreeSlot}
              className="px-4 py-3 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#202124] border border-[#EAE6E1] text-xs sm:text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <CalendarSearch className="w-4 h-4 text-[#555555] shrink-0" />
              <span>Find a Common Free Slot</span>
            </button>
          </div>
        </div>

        {/* Desktop Right Blended Illustration */}
        <div className="hidden md:block relative min-h-[300px] lg:min-h-[325px] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 7%, rgba(0,0,0,0.88) 16%, black 26%, black 100%)',
              maskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 7%, rgba(0,0,0,0.88) 16%, black 26%, black 100%)',
            }}
          >
            <SafeMediaImage
              src={ASSETS.home.heroDesktop}
              alt="Three IDEA LAB students collaborating on a laptop at Saveetha Engineering College campus"
              fallbackLabel="IDEA LAB Collaboration"
              className="w-full h-full object-cover object-[56%_45%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
