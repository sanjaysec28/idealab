import React from 'react';
import { ChevronDown, Check, Clock, AlertTriangle } from 'lucide-react';
import {
  DaySlotSchedule,
  TIME_SLOTS,
  TimeSlotId,
  TimetableClassEntry,
  WEEKDAYS,
  WeekdayId,
} from '../../types/timetable';
import { getCellKey, TimetableGridMap } from '../../utils/timetableCalculations';

interface TimeSlotSelectorProps {
  selectedDays: WeekdayId[];
  scheduleByDay: DaySlotSchedule;
  expandedDays: WeekdayId[];
  gridMap: TimetableGridMap;
  editingClassId?: string | null;
  onToggleExpandDay: (day: WeekdayId) => void;
  onToggleSlot: (day: WeekdayId, slotId: TimeSlotId) => void;
  error?: string;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedDays,
  scheduleByDay,
  expandedDays,
  gridMap,
  editingClassId,
  onToggleExpandDay,
  onToggleSlot,
  error,
}) => {
  const orderedSelectedDays = WEEKDAYS.filter((day) => selectedDays.includes(day.id));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-white">Select Time Slots</label>
        <span className="text-[11px] text-white/60">Per selected day</span>
      </div>

      {orderedSelectedDays.length === 0 ? (
        <div className="rounded-2xl bg-white/6 border border-white/10 px-3.5 py-3 text-[11px] text-white/65 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#E63946] shrink-0" />
          <span>Select one or more class days above to choose periods.</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5">
          {orderedSelectedDays.map((day) => {
            const isExpanded = expandedDays.includes(day.id);
            const selectedSlots = scheduleByDay[day.id] ?? [];

            return (
              <div
                key={day.id}
                className="rounded-2xl bg-white/8 border border-white/12 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => onToggleExpandDay(day.id)}
                  aria-expanded={isExpanded}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{day.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        selectedSlots.length > 0
                          ? 'bg-[#E63946] text-white'
                          : 'bg-white/12 text-white/70'
                      }`}
                    >
                      {selectedSlots.length}{' '}
                      {selectedSlots.length === 1 ? 'slot' : 'slots'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-white/70 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-white/10">
                    {TIME_SLOTS.map((slot) => {
                      const isChecked = selectedSlots.includes(slot.id);
                      const occupiedBy: TimetableClassEntry | undefined =
                        gridMap[getCellKey(day.id, slot.id)];
                      const hasConflict = Boolean(
                        occupiedBy && occupiedBy.id !== editingClassId
                      );

                      return (
                        <label
                          key={slot.id}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-[#E63946]/20 border border-[#E63946] text-white'
                              : 'bg-white text-[#202124] border border-transparent hover:bg-[#F5F1EC]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleSlot(day.id, slot.id)}
                              className="sr-only"
                            />
                            <span
                              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                isChecked
                                  ? 'bg-[#E63946] border-[#E63946] text-white'
                                  : 'bg-white border-[#D5D0CA]'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3" />}
                            </span>
                            <span className="font-medium truncate">{slot.label}</span>
                          </div>

                          {hasConflict && occupiedBy && (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${
                                isChecked
                                  ? 'bg-[#E63946] text-white'
                                  : 'bg-[#FFF0F1] text-[#E63946]'
                              }`}
                            >
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {occupiedBy.subjectCode}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="text-[11px] text-[#FF8A93] font-medium">{error}</p>}
    </div>
  );
};
