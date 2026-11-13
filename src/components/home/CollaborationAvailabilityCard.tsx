import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Info, Target } from 'lucide-react';

interface CollaborationAvailabilityCardProps {
  isOptedIn: boolean;
  isSaving?: boolean;
  saveError?: string | null;
  hasValidTimetable: boolean;
  hasFreePeriodTodayOrWeekly: boolean;
  onToggle: (nextValue: boolean) => void;
}

export const CollaborationAvailabilityCard: React.FC<CollaborationAvailabilityCardProps> = ({
  isOptedIn,
  isSaving = false,
  saveError = null,
  hasValidTimetable,
  hasFreePeriodTodayOrWeekly,
  onToggle,
}) => {
  const isActivelyDiscoverable =
    isOptedIn && hasValidTimetable && hasFreePeriodTodayOrWeekly;

  return (
    <section className="bg-white rounded-[22px] border border-[#EAE6E1] shadow-[0_2px_12px_rgba(32,33,36,0.03)] p-5 space-y-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Target className="w-4.5 h-4.5 text-[#E63946] shrink-0" />
          <h2 className="text-[15px] font-bold text-[#202124] leading-snug">
            Your Collaboration Availability
          </h2>
        </div>

        {/* Accessible ON/OFF Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={isOptedIn}
          aria-label="Toggle collaboration availability"
          disabled={isSaving || !hasValidTimetable}
          onClick={() => onToggle(!isOptedIn)}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946] ${
            isOptedIn ? 'bg-[#E63946]' : 'bg-[#D6D2CB]'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${
              isOptedIn ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {saveError && (
        <div
          role="alert"
          className="rounded-2xl bg-[#FFF0F1] border border-[#E63946]/25 p-3 flex items-start gap-2 text-xs text-[#E63946]"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{saveError}</span>
        </div>
      )}

      {isActivelyDiscoverable ? (
        <div className="rounded-2xl bg-[#EAF8EE] border border-[#C9EED5] p-3.5 flex items-start gap-2.5">
          <CheckCircle2 className="w-4.5 h-4.5 text-[#177E48] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#156D3F]">
              You&apos;re Available for Collaboration
            </p>
            <p className="text-[11px] text-[#1F7A4D] mt-0.5 leading-relaxed">
              Other students can see your free periods and connect with you.
            </p>
          </div>
        </div>
      ) : !hasValidTimetable ? (
        <div className="rounded-2xl bg-[#FFF8EB] border border-[#F3DFB6] p-3.5 flex items-start gap-2.5">
          <Info className="w-4.5 h-4.5 text-[#B45309] shrink-0 mt-0.5" />
          <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-bold text-[#92400E]">
              Timetable required before sharing
            </p>
            <p className="text-[11px] text-[#9A5B13] leading-relaxed">
              Submit your semester timetable first so your free periods can be verified before opting in.
            </p>
            <Link
              to="/timetable"
              className="inline-block text-[11px] font-bold text-[#E63946] hover:underline"
            >
              Set Up Timetable →
            </Link>
          </div>
        </div>
      ) : isOptedIn && !hasFreePeriodTodayOrWeekly ? (
        <div className="rounded-2xl bg-[#FFF8EB] border border-[#F3DFB6] p-3.5 flex items-start gap-2.5">
          <Info className="w-4.5 h-4.5 text-[#B45309] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#92400E]">
              No free periods available
            </p>
            <p className="text-[11px] text-[#9A5B13] mt-0.5 leading-relaxed">
              Students appear in availability discovery only when they have at least one free period.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 flex items-start gap-2.5">
          <Info className="w-4.5 h-4.5 text-[#777777] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#202124]">
              You&apos;re not currently sharing your availability.
            </p>
            <p className="text-[11px] text-[#777777] mt-0.5 leading-relaxed">
              Collaboration sharing is opt-in. Turn ON when you want teammates to find your free slots.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
