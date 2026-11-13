import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Send, X } from 'lucide-react';
import {
  TimetableClassEntry,
  TimetableSubmissionRecord,
  TimetableSummaryMetrics,
} from '../../types/timetable';

interface SubmitTimetableCardProps {
  classes: TimetableClassEntry[];
  summary: TimetableSummaryMetrics;
  hasConflicts: boolean;
  lastSubmission: TimetableSubmissionRecord | null;
  isDirtySinceSubmit: boolean;
  isSubmitting: boolean;
  onConfirmSubmit: () => Promise<void>;
}

export const SubmitTimetableCard: React.FC<SubmitTimetableCardProps> = ({
  classes,
  summary,
  hasConflicts,
  lastSubmission,
  isDirtySinceSubmit,
  isSubmitting,
  onConfirmSubmit,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadySubmittedCurrent = Boolean(lastSubmission && !isDirtySinceSubmit);

  const handleOpenConfirm = () => {
    setError(null);
    if (classes.length === 0) {
      setError('Add at least one class before submitting your timetable.');
      return;
    }
    if (hasConflicts) {
      setError('Resolve all schedule conflicts before submitting.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    setError(null);
    try {
      await onConfirmSubmit();
      setShowConfirmModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit timetable.');
      setShowConfirmModal(false);
    }
  };

  return (
    <>
      <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-xs p-5 space-y-3">
        {error && (
          <div className="p-2.5 rounded-xl bg-[#FFF0F1] border border-[#E63946]/25 text-[#E63946] text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {alreadySubmittedCurrent && lastSubmission ? (
          <div className="p-3.5 rounded-2xl bg-[#32B878]/10 border border-[#32B878]/25 space-y-1.5">
            <div className="flex items-center gap-2 text-[#1F7A4D]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold">Timetable Submitted (Testing Mode)</span>
            </div>
            <p className="text-[11px] text-[#555555] leading-relaxed">
              Saved locally for this test session (ID:{' '}
              <span className="font-semibold text-[#202124]">
                {lastSubmission.submissionId}
              </span>
              ). Modify any class to unlock re-submission.
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-[#777777] leading-relaxed">
            Review your subjects and utilization above before submitting your semester timetable.
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
              ? 'Submitted for Test Session'
              : isSubmitting
              ? 'Submitting Timetable...'
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
          <div className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="tt-confirm-title" className="text-base font-bold text-[#202124]">
                  Confirm Timetable Submission
                </h3>
                <p className="text-xs text-[#777777] mt-0.5">
                  Testing-mode submission — stored for this session without modifying production Firestore approvals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                aria-label="Close confirmation dialog"
                className="text-[#777777] hover:text-[#202124] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

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

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
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
                onClick={() => setShowConfirmModal(false)}
                className="h-10 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F1EC] border border-[#EAE6E1] text-xs font-semibold text-[#202124] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleConfirm()}
                className="h-10 px-5 rounded-xl bg-[#E63946] hover:bg-[#D92F3C] text-white text-xs font-bold shadow-sm shadow-[#E63946]/25 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
