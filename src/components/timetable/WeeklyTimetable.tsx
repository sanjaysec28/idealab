import React from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import {
  DaySlotSchedule,
  TIME_SLOTS,
  TimeSlotId,
  TimetableClassEntry,
  TimetableSummaryMetrics,
  WEEKDAYS,
  WeekdayId,
} from '../../types/timetable';
import { getCellKey, TimetableGridMap } from '../../utils/timetableCalculations';
import { TimetableCell } from './TimetableCell';

interface WeeklyTimetableProps {
  gridMap: TimetableGridMap;
  formScheduleByDay: DaySlotSchedule;
  formSelectedDays: WeekdayId[];
  editingClassId: string | null;
  summary: TimetableSummaryMetrics;
  onSelectEmptyCell: (day: WeekdayId, slotId: TimeSlotId) => void;
  onSelectOccupiedCell: (entry: TimetableClassEntry) => void;
  onResetView: () => void;
}

export const WeeklyTimetable: React.FC<WeeklyTimetableProps> = ({
  gridMap,
  formScheduleByDay,
  formSelectedDays,
  editingClassId,
  summary,
  onSelectEmptyCell,
  onSelectOccupiedCell,
  onResetView,
}) => {
  return (
    <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-xs p-5 sm:p-6 flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EAE6E1]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#202124]">
              My Weekly Timetable
            </h2>
            <p className="text-xs text-[#777777]">
              Your class schedule for this semester.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="h-9 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] text-xs font-semibold text-[#202124] inline-flex items-center">
            Mon – Sat
          </span>

          <button
            type="button"
            onClick={onResetView}
            className="h-9 px-3.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#EAE6E1] text-xs font-semibold text-[#777777] hover:text-[#202124] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Weekly Grid (horizontally scrollable on narrow screens) */}
      <div className="mt-4 overflow-x-auto pb-1">
        <div className="min-w-[660px]">
          {/* Column Headers */}
          <div className="grid grid-cols-[118px_repeat(6,minmax(0,1fr))] gap-2 mb-2">
            <div className="px-2 py-2 text-[11px] font-bold uppercase tracking-wider text-[#777777] flex items-center">
              Time
            </div>
            {WEEKDAYS.map((day) => (
              <div
                key={day.id}
                className="py-2 rounded-xl bg-[#F5F1EC] text-center text-xs font-bold text-[#202124]"
              >
                {day.shortLabel}
              </div>
            ))}
          </div>

          {/* Period Rows */}
          <div className="space-y-2">
            {TIME_SLOTS.map((slot) => (
              <div
                key={slot.id}
                className="grid grid-cols-[118px_repeat(6,minmax(0,1fr))] gap-2 items-stretch"
              >
                <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] px-2.5 py-2 flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-[#202124] leading-snug">
                    {slot.label.split('–')[0].trim()}
                  </span>
                  <span className="text-[10px] text-[#777777] leading-snug">
                    to {slot.label.split('–')[1].trim()}
                  </span>
                </div>

                {WEEKDAYS.map((day) => {
                  const entry = gridMap[getCellKey(day.id, slot.id)];
                  const isSelectedInForm =
                    formSelectedDays.includes(day.id) &&
                    Boolean(formScheduleByDay[day.id]?.includes(slot.id));
                  const isHighlightedClass = Boolean(
                    entry && editingClassId && entry.id === editingClassId
                  );

                  return (
                    <TimetableCell
                      key={getCellKey(day.id, slot.id)}
                      day={day.id}
                      dayLabel={day.label}
                      slotId={slot.id}
                      slotLabel={slot.label}
                      entry={entry}
                      isSelectedInForm={isSelectedInForm}
                      isHighlightedClass={isHighlightedClass}
                      onSelectEmptyCell={onSelectEmptyCell}
                      onSelectOccupiedCell={onSelectOccupiedCell}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty Timetable Helper Notice */}
      {summary.totalSubjects === 0 && (
        <p className="mt-3 text-center text-xs text-[#777777] bg-[#FAF8F5] border border-[#EAE6E1] rounded-xl py-2.5 px-3">
          Your timetable is empty. Enter subject details on the left or click any{' '}
          <strong className="text-[#202124]">+</strong> free period above to schedule classes.
        </p>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-[#EAE6E1] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#777777]">
          <div className="inline-flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#E63946] inline-block" />
            <span className="font-medium text-[#202124]">Class</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#FAF8F5] border border-[#EAE6E1] inline-block" />
            <span className="font-medium text-[#202124]">Free Period</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#FFF0F1] border border-[#E63946] inline-block" />
            <span className="font-medium text-[#202124]">Selected</span>
          </div>
        </div>

        <span className="text-[11px] text-[#777777]">
          Click any class card to edit • Click + to select slot
        </span>
      </div>

      {/* Statistics Below the Grid */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 text-center sm:text-left">
          <p className="text-[11px] font-medium text-[#777777]">Total Subjects</p>
          <p className="text-lg sm:text-xl font-extrabold text-[#202124] mt-0.5">
            {summary.totalSubjects}
          </p>
        </div>

        <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 text-center sm:text-left">
          <p className="text-[11px] font-medium text-[#777777]">Class Days</p>
          <p className="text-lg sm:text-xl font-extrabold text-[#202124] mt-0.5">
            {summary.classDays}
          </p>
        </div>

        <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 text-center sm:text-left">
          <p className="text-[11px] font-medium text-[#777777]">Total Classes</p>
          <p className="text-lg sm:text-xl font-extrabold text-[#E63946] mt-0.5">
            {summary.totalClasses}
          </p>
        </div>
      </div>
    </section>
  );
};
