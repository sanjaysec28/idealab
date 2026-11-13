import React from 'react';
import { Check } from 'lucide-react';
import { WEEKDAYS, WeekdayId } from '../../types/timetable';

interface DaySelectorProps {
  selectedDays: WeekdayId[];
  onToggleDay: (day: WeekdayId) => void;
  error?: string;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDays,
  onToggleDay,
  error,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-white">Select Class Days</label>
        <span className="text-[11px] text-white/60">
          {selectedDays.length} {selectedDays.length === 1 ? 'day' : 'days'} selected
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
        {WEEKDAYS.map((day) => {
          const isSelected = selectedDays.includes(day.id);
          return (
            <button
              key={day.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggleDay(day.id)}
              className={`h-9.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-[#E63946] hover:bg-[#D92F3C] text-white shadow-sm shadow-[#E63946]/30'
                  : 'bg-white hover:bg-[#F5F1EC] text-[#202124]'
              }`}
            >
              <span className="truncate">{day.label}</span>
              {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
            </button>
          );
        })}
      </div>

      {error && <p className="text-[11px] text-[#FF8A93] font-medium">{error}</p>}
    </div>
  );
};
