import React from 'react';
import { Plus, Pencil, AlertCircle, RotateCcw } from 'lucide-react';
import { ClassFormValues, TimeSlotId, TimetableValidationResult, WeekdayId } from '../../types/timetable';
import { TimetableGridMap } from '../../utils/timetableCalculations';
import { DaySelector } from './DaySelector';
import { TimeSlotSelector } from './TimeSlotSelector';

interface AddClassPanelProps {
  formValues: ClassFormValues;
  editingClassId: string | null;
  expandedDays: WeekdayId[];
  gridMap: TimetableGridMap;
  validationErrors: TimetableValidationResult['errors'] | null;
  onFieldChange: (field: 'subjectCode' | 'subjectName' | 'facultyName', value: string) => void;
  onToggleDay: (day: WeekdayId) => void;
  onToggleExpandDay: (day: WeekdayId) => void;
  onToggleSlot: (day: WeekdayId, slotId: TimeSlotId) => void;
  onClear: () => void;
  onFinalize: (e: React.FormEvent) => void;
}

export const AddClassPanel: React.FC<AddClassPanelProps> = ({
  formValues,
  editingClassId,
  expandedDays,
  gridMap,
  validationErrors,
  onFieldChange,
  onToggleDay,
  onToggleExpandDay,
  onToggleSlot,
  onClear,
  onFinalize,
}) => {
  const isEditing = Boolean(editingClassId);
  const topBannerError = validationErrors?.conflict || validationErrors?.duplicate;

  return (
    <aside className="bg-[#202020] rounded-[24px] p-5 sm:p-6 text-white shadow-lg flex flex-col lg:sticky lg:top-[88px] lg:max-h-[calc(100dvh-108px)] lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:thin] lg:[scrollbar-color:rgba(255,255,255,0.22)_transparent]">
      {/* Header */}
      <div className="flex items-start gap-3.5 pb-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-[#E63946] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#E63946]/30">
          {isEditing ? <Pencil className="w-4.5 h-4.5" /> : <Plus className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-white">
              {isEditing ? 'Edit Class' : 'Add New Class'}
            </h2>
            {isEditing && (
              <span className="px-2 py-0.5 rounded-full bg-white/12 text-[10px] font-semibold text-white/90">
                Editing
              </span>
            )}
          </div>
          <p className="text-xs text-white/65 mt-0.5 leading-relaxed">
            Enter subject details and choose the class timings.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onFinalize} noValidate className="mt-5 space-y-4 flex-1 flex flex-col">
        {topBannerError && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-[#E63946]/20 border border-[#E63946] text-white text-xs font-medium flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-[#FF99A1] shrink-0 mt-0.5" />
            <span className="leading-relaxed">{topBannerError}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="tt-subject-code"
            className="block text-xs font-semibold text-white mb-1.5"
          >
            Subject Code
          </label>
          <input
            id="tt-subject-code"
            type="text"
            value={formValues.subjectCode}
            onChange={(e) => onFieldChange('subjectCode', e.target.value)}
            placeholder="e.g., 19AI303"
            className="w-full h-10 bg-white border border-transparent focus:border-[#E63946] rounded-xl px-3.5 text-xs font-medium text-[#202124] placeholder-[#999999] focus:outline-none transition-colors uppercase"
          />
          {validationErrors?.subjectCode && (
            <p className="mt-1 text-[11px] text-[#FF8A93] font-medium">
              {validationErrors.subjectCode}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="tt-subject-name"
            className="block text-xs font-semibold text-white mb-1.5"
          >
            Subject Name
          </label>
          <input
            id="tt-subject-name"
            type="text"
            value={formValues.subjectName}
            onChange={(e) => onFieldChange('subjectName', e.target.value)}
            placeholder="e.g., Machine Learning"
            className="w-full h-10 bg-white border border-transparent focus:border-[#E63946] rounded-xl px-3.5 text-xs font-medium text-[#202124] placeholder-[#999999] focus:outline-none transition-colors"
          />
          {validationErrors?.subjectName && (
            <p className="mt-1 text-[11px] text-[#FF8A93] font-medium">
              {validationErrors.subjectName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="tt-faculty-name"
            className="block text-xs font-semibold text-white mb-1.5"
          >
            Faculty Name
          </label>
          <input
            id="tt-faculty-name"
            type="text"
            value={formValues.facultyName}
            onChange={(e) => onFieldChange('facultyName', e.target.value)}
            placeholder="e.g., Dr. Kavitha R"
            className="w-full h-10 bg-white border border-transparent focus:border-[#E63946] rounded-xl px-3.5 text-xs font-medium text-[#202124] placeholder-[#999999] focus:outline-none transition-colors"
          />
          {validationErrors?.facultyName && (
            <p className="mt-1 text-[11px] text-[#FF8A93] font-medium">
              {validationErrors.facultyName}
            </p>
          )}
        </div>

        <DaySelector
          selectedDays={formValues.selectedDays}
          onToggleDay={onToggleDay}
          error={validationErrors?.days}
        />

        <TimeSlotSelector
          selectedDays={formValues.selectedDays}
          scheduleByDay={formValues.scheduleByDay}
          expandedDays={expandedDays}
          gridMap={gridMap}
          editingClassId={editingClassId}
          onToggleExpandDay={onToggleExpandDay}
          onToggleSlot={onToggleSlot}
          error={validationErrors?.slots}
        />

        {/* Bottom Actions */}
        <div className="pt-3 mt-auto border-t border-white/10 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onClear}
            className="h-10.5 px-4 rounded-xl bg-white/10 hover:bg-white/18 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Clear'}</span>
          </button>

          <button
            type="submit"
            className="h-10.5 px-4 rounded-xl bg-[#E63946] hover:bg-[#D92F3C] text-white text-xs font-bold shadow-md shadow-[#E63946]/25 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isEditing ? (
              <span>Save Changes</span>
            ) : (
              <span>Finalize Class</span>
            )}
          </button>
        </div>
      </form>
    </aside>
  );
};
