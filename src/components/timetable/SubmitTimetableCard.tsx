import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Lock,
  Save,
  ShieldCheck,
  X,
} from 'lucide-react';
import { getFriendlyFirebaseErrorMessage } from '../../firebase/errorHandling';
import {
  StudentTimetableDoc,
  TimetableAcademicMeta,
  TimetableClassEntry,
  TimetableSummaryMetrics,
} from '../../types/timetable';
import {
  ACADEMIC_YEARS,
  DEPARTMENTS,
  SEMESTERS,
} from '../../utils/academicConstants';

interface SubmitTimetableCardProps {
  classes: TimetableClassEntry[];
  summary: TimetableSummaryMetrics;
  hasConflicts: boolean;
  savedTimetable: StudentTimetableDoc | null;
  initialAcademicMeta: TimetableAcademicMeta;
  isDirtySinceSave: boolean;
  isSavingDraft: boolean;
  isFinalizing: boolean;
  submitError: string | null;
  onSaveDraft: (meta: TimetableAcademicMeta) => Promise<void>;
  onFinalize: (meta: TimetableAcademicMeta) => Promise<void>;
}

export const SubmitTimetableCard: React.FC<SubmitTimetableCardProps> = ({
  classes,
  summary,
  hasConflicts,
  savedTimetable,
  initialAcademicMeta,
  isDirtySinceSave,
  isSavingDraft,
  isFinalizing,
  submitError,
  onSaveDraft,
  onFinalize,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [meta, setMeta] = useState<TimetableAcademicMeta>(initialAcademicMeta);

  useEffect(() => {
    setMeta(initialAcademicMeta);
  }, [initialAcademicMeta]);

  const isInReview = savedTimetable?.submissionStatus === 'in_review' && !savedTimetable?.isLocked;
  const combinedError = localError || submitError;
  const isBusy = isSavingDraft || isFinalizing;

  const validateReady = (): boolean => {
    setLocalError(null);
    if (classes.length === 0) {
      setLocalError('Add at least one class before continuing.');
      return false;
    }
    if (hasConflicts) {
      setLocalError('Resolve all schedule conflicts before continuing.');
      return false;
    }
    return true;
  };

  const handleSaveDraftClick = async () => {
    if (isBusy || !validateReady()) return;
    try {
      await onSaveDraft(meta);
    } catch (err) {
      setLocalError(
        getFriendlyFirebaseErrorMessage(err, 'Unable to save timetable draft. Please retry.')
      );
    }
  };

  const handleOpenFinalizeConfirm = () => {
    if (isBusy || !validateReady()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmFinalize = async () => {
    if (isBusy) return;
    setLocalError(null);
    try {
      await onFinalize(meta);
      setShowConfirmModal(false);
    } catch (err) {
      setLocalError(
        getFriendlyFirebaseErrorMessage(err, 'Unable to finalize timetable. Please retry.')
      );
    }
  };

  return (
    <>
      <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-xs p-5 space-y-3.5">
        {combinedError && (
          <div
            role="alert"
            className="p-2.5 rounded-xl bg-[#FFF0F1] border border-[#E63946]/25 text-[#E63946] text-xs font-medium flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{combinedError}</span>
          </div>
        )}

        {/* Academic Details Selection */}
        <div className="space-y-2.5 bg-[#FAF8F5] border border-[#EAE6E1] rounded-2xl p-3.5">
          <div>
            <label
              htmlFor="tt-meta-dept"
              className="block text-[10px] font-semibold text-[#555555] mb-1"
            >
              Department
            </label>
            <select
              id="tt-meta-dept"
              value={meta.department}
              onChange={(e) => setMeta((prev) => ({ ...prev, department: e.target.value }))}
              className="w-full h-9 rounded-xl bg-white border border-[#EAE6E1] px-2.5 text-xs font-medium text-[#202124] focus:outline-none focus:border-[#E63946]"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
              {meta.department &&
                !DEPARTMENTS.includes(meta.department as (typeof DEPARTMENTS)[number]) && (
                  <option value={meta.department}>{meta.department}</option>
                )}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="tt-meta-year"
                className="block text-[10px] font-semibold text-[#555555] mb-1"
              >
                Academic Year
              </label>
              <select
                id="tt-meta-year"
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
              <label
                htmlFor="tt-meta-sem"
                className="block text-[10px] font-semibold text-[#555555] mb-1"
              >
                Semester
              </label>
              <select
                id="tt-meta-sem"
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

        {isInReview && savedTimetable ? (
          <div className="p-3.5 rounded-2xl bg-[#FFF8EB] border border-[#F3DFB6] space-y-1.5">
            <div className="flex items-center gap-2 text-[#92400E]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold">Draft Saved — Review Mode</span>
            </div>
            <p className="text-[11px] text-[#9A5B13] leading-relaxed">
              Draft v{savedTimetable.version} is saved. Edit any class on the left or confirm below to permanently lock your timetable and unlock the IDEA LAB dashboard.
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-[#777777] leading-relaxed">
            Save your timetable draft first to review all periods carefully before permanent lock.
          </p>
        )}

        <div className="space-y-2.5">
          {(!isInReview || isDirtySinceSave) && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void handleSaveDraftClick()}
              className="w-full h-11 px-4 rounded-xl bg-[#202124] hover:bg-[#333333] disabled:bg-[#202124]/50 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              <span>
                {isSavingDraft
                  ? 'Saving Draft...'
                  : isInReview
                  ? 'Save Draft Changes'
                  : 'Save Draft & Review Timetable'}
              </span>
            </button>
          )}

          {isInReview && (
            <button
              type="button"
              disabled={isBusy}
              onClick={handleOpenFinalizeConfirm}
              className="w-full h-11 px-4 rounded-xl bg-[#E63946] hover:bg-[#D92F3C] disabled:bg-[#E63946]/50 text-white text-xs font-bold shadow-md shadow-[#E63946]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                {isFinalizing ? 'Finalizing Timetable...' : 'Final Confirm & Lock'}
              </span>
            </button>
          )}
        </div>
      </section>

      {/* Stage C: Permanent Lock Final Confirmation Modal */}
      {showConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tt-confirm-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="tt-confirm-title" className="text-base font-bold text-[#202124]">
                    Confirm &amp; Permanently Lock Timetable?
                  </h3>
                  <p className="text-xs text-[#777777] mt-0.5">
                    Stage C · Final Confirmation
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setShowConfirmModal(false)}
                aria-label="Close confirmation dialog"
                className="text-[#777777] hover:text-[#202124] p-1 rounded-lg cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFF0F1] border border-[#E63946]/25 text-xs text-[#202124] leading-relaxed">
              <strong>Permanent Lock Warning:</strong> After finalizing, you cannot edit your timetable again. Only an IDEA LAB Admin can modify your timetable after confirmation.
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
                <p className="text-[10px] font-medium text-[#777777]">Free Slots</p>
                <p className="text-base font-extrabold text-[#32B878] mt-0.5">
                  {summary.freePeriods}
                </p>
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
                disabled={isBusy}
                onClick={() => setShowConfirmModal(false)}
                className="h-10 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F1EC] border border-[#EAE6E1] text-xs font-semibold text-[#202124] cursor-pointer disabled:opacity-50"
              >
                Go Back &amp; Review
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void handleConfirmFinalize()}
                className="h-10 px-5 rounded-xl bg-[#E63946] hover:bg-[#D92F3C] text-white text-xs font-bold shadow-sm shadow-[#E63946]/25 cursor-pointer disabled:opacity-60 inline-flex items-center gap-2"
              >
                {isBusy && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <Lock className="w-3.5 h-3.5" />
                <span>{isFinalizing ? 'Locking Timetable...' : 'Confirm & Finalize'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
