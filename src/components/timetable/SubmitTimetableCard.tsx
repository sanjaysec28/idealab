import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Send, X, ArrowRight } from 'lucide-react';
import {
  StudentTimetableDoc,
  TimetableAcademicMeta,
  TimetableClassEntry,
  TimetableSummaryMetrics,
} from '../../types/timetable';

const DEPARTMENTS = [
  'AI & Data Science',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engg',
  'Electrical & Electronics Engg',
  'Mechanical Engineering',
  'Robotics & Automation',
  'Biomedical Engineering',
  'Civil Engineering',
];

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

interface SubmitTimetableCardProps {
  classes: TimetableClassEntry[];
  summary: TimetableSummaryMetrics;
  hasConflicts: boolean;
  savedTimetable: StudentTimetableDoc | null;
  initialAcademicMeta: TimetableAcademicMeta;
  isDirtySinceSubmit: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  onConfirmSubmit: (meta: TimetableAcademicMeta) => Promise<void>;
}

export const SubmitTimetableCard: React.FC<SubmitTimetableCardProps> = ({
  classes,
  summary,
  hasConflicts,
  savedTimetable,
  initialAcademicMeta,
  isDirtySinceSubmit,
  isSubmitting,
  submitError,
  onConfirmSubmit,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [meta, setMeta] = useState<TimetableAcademicMeta>(initialAcademicMeta);

  useEffect(() => {
    setMeta(initialAcademicMeta);
  }, [initialAcademicMeta]);

  const alreadySubmittedCurrent = Boolean(
    savedTimetable?.submissionStatus === 'submitted' && !isDirtySinceSubmit
  );

  const combinedError = localError || submitError;

  const handleOpenConfirm = () => {
    setLocalError(null);
    if (classes.length === 0) {
      setLocalError('Add at least one class before submitting your timetable.');
      return;
    }
    if (hasConflicts) {
      setLocalError('Resolve all schedule conflicts before submitting.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setLocalError(null);
    try {
      await onConfirmSubmit(meta);
      setShowConfirmModal(false);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Unable to save timetable. Please try again.'
      );
    }
  };

  return (
    <>
      <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-xs p-5 space-y-3">
        {combinedError && (
          <div
            role="alert"
            className="p-2.5 rounded-xl bg-[#FFF0F1] border border-[#E63946]/25 text-[#E63946] text-xs font-medium flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{combinedError}</span>
          </div>
        )}

        {alreadySubmittedCurrent && savedTimetable ? (
          <div className="p-3.5 rounded-2xl bg-[#32B878]/10 border border-[#32B878]/25 space-y-2">
            <div className="flex items-center gap-2 text-[#1F7A4D]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold">Timetable Saved to Profile</span>
            </div>
            <p className="text-[11px] text-[#555555] leading-relaxed">
              Version {savedTimetable.version} • {savedTimetable.department} ({savedTimetable.academicYear},{' '}
              {savedTimetable.semester}). Modify any class to submit an updated version.
            </p>
            <Link
              to="/home"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946] hover:underline"
            >
              <span>Go to IDEA LAB Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <p className="text-[11px] text-[#777777] leading-relaxed">
            Review your subjects and utilization above before saving your semester timetable to IDEA LAB.
          </p>
        )}

        <button
          type="button"
          disabled={isSubmitting || alreadySubmittedCurrent}
          onClick={handleOpenConfirm}
          className="w-full h-11 px-4 rounded-xl bg-[#E63946] hover:bg-[#D92F3C] disabled:bg-[#E63946]/50 text-white text-xs font-bold shadow-md shadow-[#E63946]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
          <span>
            {alreadySubmittedCurrent
              ? 'Timetable Submitted'
              : isSubmitting
              ? 'Saving Timetable...'
              : 'Submit Final Timetable'}
          </span>
        </button>
      </section>

      {/* Confirmation Dialog */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tt-confirm-title"
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="tt-confirm-title" className="text-base font-bold text-[#202124]">
                  Confirm Final Timetable
                </h3>
                <p className="text-xs text-[#777777] mt-0.5">
                  Save your class schedule and free periods to your IDEA LAB profile.
                </p>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                aria-label="Close confirmation dialog"
                className="text-[#777777] hover:text-[#202124] p-1 rounded-lg cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {combinedError && (
              <div
                role="alert"
                className="p-2.5 rounded-xl bg-[#FFF0F1] border border-[#E63946]/25 text-[#E63946] text-xs font-medium flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{combinedError}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2.5 bg-[#FAF8F5] border border-[#EAE6E1] rounded-2xl p-3.5 text-center">
              <div>
                <p className="text-[10px] font-medium text-[#777777]">Subjects</p>
                <p className="text-base font-extrabold text-[#202124] mt-0.5">
                  {summary.totalSubjects}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-[#777777]">Periods</p>
                <p className="text-base font-extrabold text-[#202124] mt-0.5">
                  {summary.totalClasses}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-[#777777]">Utilization</p>
                <p className="text-base font-extrabold text-[#E63946] mt-0.5">
                  {summary.utilizationPercent}%
                </p>
              </div>
            </div>

            {/* Academic Metadata Fields */}
            <div className="space-y-2.5 bg-[#FAF8F5] border border-[#EAE6E1] rounded-2xl p-3.5">
              <div>
                <label className="block text-[10px] font-semibold text-[#555555] mb-1">
                  Department
                </label>
                <select
                  value={meta.department}
                  onChange={(e) => setMeta((prev) => ({ ...prev, department: e.target.value }))}
                  className="w-full h-9 rounded-xl bg-white border border-[#EAE6E1] px-2.5 text-xs font-medium text-[#202124] focus:outline-none focus:border-[#E63946]"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  {!DEPARTMENTS.includes(meta.department) && (
                    <option value={meta.department}>{meta.department}</option>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-[#555555] mb-1">
                    Academic Year
                  </label>
                  <select
                    value={meta.academicYear}
                    onChange={(e) => setMeta((prev) => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full h-9 rounded-xl bg-white border border-[#EAE6E1] px-2.5 text-xs font-medium text-[#202124] focus:outline-none focus:border-[#E63946]"
                  >
                    {ACADEMIC_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#555555] mb-1">
                    Semester
                  </label>
                  <select
                    value={meta.semester}
                    onChange={(e) => setMeta((prev) => ({ ...prev, semester: e.target.value }))}
                    className="w-full h-9 rounded-xl bg-white border border-[#EAE6E1] px-2.5 text-xs font-medium text-[#202124] focus:outline-none focus:border-[#E63946]"
                  >
                    {SEMESTERS.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-[#202124] truncate">
                    {cls.subjectCode} — {cls.subjectName}
                  </span>
                  <span className="text-[11px] text-[#777777] shrink-0 ml-2">
                    {cls.facultyName}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EAE6E1]">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="h-10 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F1EC] border border-[#EAE6E1] text-xs font-semibold text-[#202124] cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleConfirm()}
                className="h-10 px-5 rounded-xl bg-[#E63946] hover:bg-[#D92F3C] text-white text-xs font-bold shadow-sm shadow-[#E63946]/25 cursor-pointer disabled:opacity-60 inline-flex items-center gap-2"
              >
                {isSubmitting && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{isSubmitting ? 'Saving to Profile...' : 'Confirm & Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
