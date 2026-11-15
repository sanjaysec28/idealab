import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  CalendarSearch,
  Clock,
  RefreshCw,
  Users,
} from 'lucide-react';
import { ASSETS } from '../../utils/assets';
import { CurrentPeriodStatus } from '../../utils/timetableCalculations';
import { SafeMediaImage } from './SafeMediaImage';

interface SmartAvailabilityHeroProps {
  studentsFreeNowCount: number;
  currentPeriod: CurrentPeriodStatus;
  isLoadingAvailability?: boolean;
  availabilityError?: string | null;
  onRetryAvailability?: () => void;
  onOpenLiveAvailability: () => void;
  onExploreAvailableStudents: () => void;
  onFindCommonFreeSlot: () => void;
}

export const SmartAvailabilityHero: React.FC<SmartAvailabilityHeroProps> = ({
  studentsFreeNowCount,
  currentPeriod,
  isLoadingAvailability = false,
  availabilityError = null,
  onRetryAvailability,
  onOpenLiveAvailability,
  onExploreAvailableStudents,
  onFindCommonFreeSlot,
}) => {
  return (
    <section className="bg-[#FAF8F5] rounded-[24px] border border-[#EAE6E1] shadow-[0_2px_14px_rgba(32,33,36,0.03)] overflow-hidden relative">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] items-stretch">
        {/* Mobile Illustration (16:9 preserves all three waving students & IDEA LAB wall sign without cropping) */}
        <div className="md:hidden relative w-full aspect-[16/9] overflow-hidden bg-[#FAF8F5]">
          <SafeMediaImage
            src={ASSETS.home.heroMobile}
            alt="Three IDEA LAB students waving inside the AICTE IDEA LAB makerspace at Saveetha Engineering College"
            fallbackLabel="IDEA LAB Campus Collaboration"
            className="w-full h-full object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/75 to-transparent" />
        </div>

        {/* Left Content Column */}
        <div className="p-5 sm:p-6 lg:p-7 xl:p-8 flex flex-col justify-center relative z-10 bg-[#FAF8F5]">
          {/* Status Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE6E1] w-fit">
            <span className="w-2.5 h-2.5 rounded-full bg-[#32B878] shrink-0" />
            <span className="text-xs font-semibold text-[#202124]">Smart Availability</span>
          </div>

          {/* Headline */}
          <h1 className="mt-3.5 text-2xl sm:text-[30px] lg:text-[32px] xl:text-[34px] font-extrabold tracking-tight leading-[1.15] text-[#202124] text-balance">
            Who’s free to{' '}
            <span className="text-[#E63946]">collaborate</span> today?
          </h1>

          {/* Supporting Copy */}
          <p className="mt-2.5 text-xs sm:text-sm text-[#5F6368] leading-relaxed max-w-[400px]">
            Find teammates, share ideas and build something amazing together.
          </p>

          {/* Prominent Clickable Live Availability Card */}
          <div className="mt-5 max-w-[460px] space-y-2">
            <button
              type="button"
              onClick={onOpenLiveAvailability}
              aria-label={`Students Free Now: ${studentsFreeNowCount}. Click to view available students.`}
              className="group w-full text-left bg-white hover:bg-white rounded-2xl border border-[#EAE6E1] hover:border-[#E63946]/45 shadow-[0_2px_10px_rgba(32,33,36,0.04)] hover:shadow-[0_6px_20px_rgba(230,57,70,0.08)] px-4 sm:px-5 py-4 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E63946]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs sm:text-sm font-bold text-[#202124] tracking-tight">
                  Students Free Now
                </span>

                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#EAF8EE] text-[#177E48] text-[10px] font-extrabold tracking-wider uppercase shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#32B878] animate-pulse" />
                  <span>LIVE</span>
                </span>
              </div>

              <div className="mt-2.5 flex items-baseline gap-3.5">
                {isLoadingAvailability ? (
                  <span
                    aria-label="Loading live count"
                    className="inline-block w-12 h-9 rounded-lg bg-[#F2EFE9] animate-pulse"
                  />
                ) : (
                  <span className="text-3xl sm:text-[38px] font-extrabold text-[#E63946] leading-none tabular-nums">
                    {studentsFreeNowCount}
                  </span>
                )}
                <p className="text-xs sm:text-[13px] text-[#5F6368] leading-snug">
                  Students currently available for collaboration.
                </p>
              </div>

              <div className="mt-3.5 pt-3 border-t border-[#F1EDE7] flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 min-w-0 text-xs font-semibold text-[#202124] tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-[#E63946] shrink-0" />
                  <span className="truncate">{currentPeriod.periodLabel}</span>
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E63946] group-hover:translate-x-0.5 transition-transform shrink-0">
                  <span>View Students</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>

            {availabilityError && onRetryAvailability && (
              <div
                role="alert"
                className="rounded-xl bg-[#FFF0F1] border border-[#E63946]/25 px-3.5 py-2 flex items-center justify-between gap-3 text-xs"
              >
                <span className="inline-flex items-center gap-1.5 text-[#E63946] font-medium min-w-0 truncate">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{availabilityError}</span>
                </span>
                <button
                  type="button"
                  onClick={onRetryAvailability}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E63946] text-white text-[11px] font-bold shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}
          </div>

          {/* Preserved Primary & Secondary Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 mt-4">
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
        <div className="hidden md:flex items-center justify-end relative min-h-[300px] lg:min-h-[315px] xl:min-h-[330px] overflow-hidden bg-[#FAF8F5]">
          <div className="relative w-full aspect-[16/9] xl:aspect-auto xl:h-full overflow-hidden">
            <SafeMediaImage
              src={ASSETS.home.heroDesktop}
              alt="Three IDEA LAB students waving inside the AICTE IDEA LAB makerspace at Saveetha Engineering College"
              fallbackLabel="IDEA LAB Collaboration"
              className="w-full h-full object-cover object-center xl:object-[52%_38%]"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 lg:w-20 xl:w-24 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-[#FAF8F5] to-transparent xl:hidden" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-[#FAF8F5] to-transparent xl:hidden" />
          </div>
        </div>
      </div>
    </section>
  );
};
