import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock } from 'lucide-react';
import { TimeSlotOption, WeekdayOption } from '../../types/timetable';

interface FreeSlotsCardProps {
  hasValidTimetable: boolean;
  weekday: WeekdayOption | null;
  isSunday: boolean;
  freeSlots: TimeSlotOption[];
}

export const FreeSlotsCard: React.FC<FreeSlotsCardProps> = ({
  hasValidTimetable,
  weekday,
  isSunday,
  freeSlots,
}) => {
  return (
    <section className="bg-white rounded-[22px] border border-[#EAE6E1] shadow-[0_2px_12px_rgba(32,33,36,0.03)] p-5 space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarDays className="w-4.5 h-4.5 text-[#E63946] shrink-0" />
          <h2 className="text-[15px] font-bold text-[#202124] truncate">
            Your Free Slots Today
          </h2>
        </div>
        {hasValidTimetable && weekday && (
          <span className="text-[11px] font-semibold text-[#777777] shrink-0">
            {weekday.shortLabel}
          </span>
        )}
      </div>

      {!hasValidTimetable ? (
        <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4 space-y-2.5">
          <p className="text-xs font-medium text-[#555555]">
            Your timetable isn&apos;t available yet.
          </p>
          <Link
            to="/timetable"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946] hover:underline"
          >
            <span>View Timetable</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : isSunday ? (
        <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4 space-y-2">
          <p className="text-xs font-medium text-[#555555]">
            No classes scheduled on Sunday.
          </p>
          <Link
            to="/timetable"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946] hover:underline"
          >
            <span>View Timetable</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : freeSlots.length === 0 ? (
        <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4 space-y-2">
          <p className="text-xs font-medium text-[#555555]">
            All scheduled periods are occupied today.
          </p>
          <Link
            to="/timetable"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946] hover:underline"
          >
            <span>View Timetable</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {freeSlots.map((slot) => (
              <div
                key={slot.id}
                className="inline-flex w-full items-center gap-2 rounded-xl bg-[#EAF8EE] border border-[#D4F0DC] px-3 py-2 text-xs font-semibold text-[#156D3F] tabular-nums"
              >
                <Clock className="w-3.5 h-3.5 text-[#177E48] shrink-0" />
                <span className="truncate">{slot.label}</span>
              </div>
            ))}
          </div>

          {/* Subtle Decorative Coral Calendar Check Illustration */}
          <div
            aria-hidden="true"
            className="hidden sm:flex xl:flex w-20 h-20 rounded-full bg-[#FFF5F5] items-center justify-center shrink-0"
          >
            <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none">
              <rect
                x="14"
                y="16"
                width="36"
                height="34"
                rx="8"
                transform="rotate(-8 32 33)"
                fill="#FFFFFF"
                stroke="#E63946"
                strokeWidth="3"
              />
              <path
                d="M17 24L48 19.5"
                stroke="#E63946"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M25 35L30.5 39.5L40 29.5"
                stroke="#E63946"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}
    </section>
  );
};
