import React from 'react';
import { Plus, Check } from 'lucide-react';
import { TimeSlotId, TimetableClassEntry, WeekdayId } from '../../types/timetable';

interface TimetableCellProps {
  day: WeekdayId;
  dayLabel: string;
  slotId: TimeSlotId;
  slotLabel: string;
  entry?: TimetableClassEntry;
  isSelectedInForm: boolean;
  isHighlightedClass: boolean;
  onSelectEmptyCell: (day: WeekdayId, slotId: TimeSlotId) => void;
  onSelectOccupiedCell: (entry: TimetableClassEntry) => void;
}

export const TimetableCell: React.FC<TimetableCellProps> = ({
  day,
  dayLabel,
  slotId,
  slotLabel,
  entry,
  isSelectedInForm,
  isHighlightedClass,
  onSelectEmptyCell,
  onSelectOccupiedCell,
}) => {
  if (entry) {
    return (
      <button
        type="button"
        onClick={() => onSelectOccupiedCell(entry)}
        title={`${entry.subjectName} (${entry.subjectCode}) — ${entry.facultyName}. Click to edit.`}
        aria-label={`${dayLabel} ${slotLabel}: ${entry.subjectName} (${entry.subjectCode}) by ${entry.facultyName}. Click to edit`}
        className={`w-full h-[84px] rounded-2xl p-2.5 text-left transition-all flex flex-col justify-between cursor-pointer bg-[#E63946] hover:bg-[#D92F3C] text-white shadow-sm ${
          isHighlightedClass
            ? 'ring-2 ring-[#202020] ring-offset-2 ring-offset-white'
            : ''
        }`}
      >
        <div className="flex items-start justify-between gap-1">
          <span className="text-sm font-extrabold tracking-tight leading-none">
            {entry.subjectAbbreviation}
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/18 text-[9px] font-bold tracking-wide uppercase leading-none shrink-0">
            {entry.subjectCode}
          </span>
        </div>

        <p className="text-[11px] font-medium text-white/90 truncate leading-tight">
          {entry.facultyName}
        </p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelectEmptyCell(day, slotId)}
      aria-label={`Select ${dayLabel} ${slotLabel} free period`}
      aria-pressed={isSelectedInForm}
      className={`w-full h-[84px] rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
        isSelectedInForm
          ? 'bg-[#FFF0F1] border-[#E63946] text-[#E63946] shadow-xs'
          : 'bg-[#FAF8F5] hover:bg-[#F5F1EC] border-[#EAE6E1] text-[#777777] hover:text-[#202124]'
      }`}
    >
      {isSelectedInForm ? (
        <>
          <Check className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Selected</span>
        </>
      ) : (
        <Plus className="w-4 h-4 opacity-70" />
      )}
    </button>
  );
};
