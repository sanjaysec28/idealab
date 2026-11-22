import React, { useState } from 'react';
import { AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { getFriendlyFirebaseErrorMessage } from '../../firebase/errorHandling';

interface TimetableWarningCardProps {
  isSubmitting: boolean;
  error: string | null;
  onAcknowledge: () => Promise<void>;
}

export const TimetableWarningCard: React.FC<TimetableWarningCardProps> = ({
  isSubmitting,
  error,
  onAcknowledge,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acknowledged || isSubmitting) return;
    await onAcknowledge();
  };

  return (
    <div className="max-w-xl mx-auto my-6 bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_6px_28px_rgba(32,33,36,0.05)] p-6 sm:p-8 space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF0F1] border border-[#E63946]/25 text-[#E63946] flex items-center justify-center shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-[#FFF0F1] text-[#E63946] text-[11px] font-bold uppercase tracking-wider">
            One-Time Timetable Policy
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#202124]">
            Important Notice Before Creating Your Timetable
          </h2>
        </div>
      </div>

      <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4 sm:p-5 space-y-3 text-xs sm:text-sm text-[#202124]">
        <div className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-[#E63946] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            1
          </span>
          <p className="leading-relaxed">
            <strong>You can create your timetable only ONCE.</strong> Your academic schedule is linked permanently to your IDEA LAB collaboration profile.
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-[#E63946] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            2
          </span>
          <p className="leading-relaxed">
            <strong>Review your timetable carefully before confirming.</strong> After saving your classes, you can still review and edit your draft before final lock.
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-[#E63946] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            3
          </span>
          <p className="leading-relaxed">
            <strong>Once finalized, your timetable will be permanently locked.</strong>
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <span className="w-5 h-5 rounded-full bg-[#E63946] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            4
          </span>
          <p className="leading-relaxed">
            <strong>Any future correction requires IDEA LAB Admin approval.</strong>
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-[#FFF0F1] border border-[#E63946]/30 text-xs font-medium text-[#E63946] flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {getFriendlyFirebaseErrorMessage(
              error,
              'Unable to save confirmation right now. Please try again.'
            )}
          </span>
        </div>
      )}

      <form onSubmit={(e) => void handleContinue(e)} className="space-y-4">
        <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#FFF8F8] border border-[#EAE6E1] cursor-pointer select-none transition-colors">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded accent-[#E63946] shrink-0 cursor-pointer"
          />
          <span className="text-xs sm:text-sm font-semibold text-[#202124] leading-snug">
            I understand that I can create my timetable only once and that it will be permanently locked after final confirmation.
          </span>
        </label>

        <button
          type="submit"
          disabled={!acknowledged || isSubmitting}
          className="w-full h-12 px-6 rounded-full bg-[#E63946] hover:bg-[#D62839] disabled:bg-[#E63946]/45 text-white text-sm font-bold shadow-md shadow-[#E63946]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Preparing Timetable Builder...</span>
            </>
          ) : (
            <>
              <span>I Understand, Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
