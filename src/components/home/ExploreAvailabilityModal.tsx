import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Clock,
  Phone,
  RefreshCw,
  Users,
  X,
} from 'lucide-react';
import {
  StudentAvailabilityDoc,
  TIME_SLOTS,
  TimeSlotId,
  WEEKDAYS,
  WeekdayId,
} from '../../types/timetable';
import { resolveProfileAvatarUrl } from '../../utils/assets';
import {
  CurrentPeriodStatus,
  getStudentsAvailableForDayAndSlot,
  sanitizePhoneForTel,
  sanitizePhoneForWhatsApp,
} from '../../utils/timetableCalculations';

interface ExploreAvailabilityModalProps {
  isOpen: boolean;
  currentUid: string;
  qualifiedStudents: StudentAvailabilityDoc[];
  currentPeriod: CurrentPeriodStatus;
  hasValidTimetable: boolean;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'IL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.79 14.07c-.24.68-1.41 1.3-1.95 1.38-.5.07-1.13.1-1.82-.12-.42-.13-.96-.31-1.65-.61-2.91-1.25-4.81-4.18-4.96-4.37-.15-.19-1.18-1.57-1.18-3 0-1.43.75-2.13 1.02-2.42.27-.29.59-.36.79-.36.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.83 2.02.9 2.17.07.15.12.33.02.52-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12 1 2.07 1.31 2.36 1.46.29.15.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.39-.24.65-.15.27.1 1.69.8 1.98.94.29.15.48.22.55.34.07.12.07.7-.17 1.38z" />
  </svg>
);

const StudentAvatar: React.FC<{
  name: string;
  photoURL?: string;
  avatarPresetId?: string;
}> = ({ name, photoURL, avatarPresetId }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const resolved = resolveProfileAvatarUrl({ photoURL, avatarPresetId });

  useEffect(() => {
    setImgFailed(false);
  }, [resolved]);

  if (!resolved || imgFailed) {
    return (
      <div className="w-11 h-11 rounded-full bg-[#FFF0F1] border border-[#E63946]/20 text-[#E63946] font-bold text-xs flex items-center justify-center shrink-0 select-none">
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setImgFailed(true)}
      className="w-11 h-11 rounded-full object-cover border border-[#EAE6E1] shrink-0 bg-[#FAF8F5]"
    />
  );
};

export const ExploreAvailabilityModal: React.FC<ExploreAvailabilityModalProps> = ({
  isOpen,
  currentUid,
  qualifiedStudents,
  currentPeriod,
  hasValidTimetable,
  isLoading,
  error,
  onRetry,
  onClose,
}) => {
  const defaultDayId: WeekdayId = currentPeriod.weekdayId ?? WEEKDAYS[0].id;
  const defaultSlotId: TimeSlotId = currentPeriod.activeSlot?.id ?? TIME_SLOTS[0].id;

  const [selectedDayId, setSelectedDayId] = useState<WeekdayId>(defaultDayId);
  const [selectedSlotId, setSelectedSlotId] = useState<TimeSlotId>(defaultSlotId);

  // Reset initial day/slot selection each time the exploration interface opens
  useEffect(() => {
    if (!isOpen) return;
    setSelectedDayId(currentPeriod.weekdayId ?? WEEKDAYS[0].id);
    setSelectedSlotId(currentPeriod.activeSlot?.id ?? TIME_SLOTS[0].id);
  }, [isOpen, currentPeriod.weekdayId, currentPeriod.activeSlot?.id]);

  // Body scroll lock & Escape-to-close while open
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const selectedWeekday = useMemo(
    () => WEEKDAYS.find((day) => day.id === selectedDayId) ?? WEEKDAYS[0],
    [selectedDayId]
  );

  const selectedSlot = useMemo(
    () => TIME_SLOTS.find((slot) => slot.id === selectedSlotId) ?? TIME_SLOTS[0],
    [selectedSlotId]
  );

  const matchingStudents = useMemo(
    () =>
      getStudentsAvailableForDayAndSlot(
        qualifiedStudents,
        selectedWeekday.id,
        selectedSlot.id
      ),
    [qualifiedStudents, selectedWeekday.id, selectedSlot.id]
  );

  if (!isOpen) return null;

  const hasAnyTimetableData = hasValidTimetable && WEEKDAYS.length > 0 && TIME_SLOTS.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="explore-availability-modal-title"
        className="bg-white w-full sm:max-w-2xl rounded-t-[20px] sm:rounded-[20px] border border-[#EAE6E1] shadow-2xl max-h-[90dvh] sm:max-h-[86dvh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-[#EAE6E1] bg-white flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="explore-availability-modal-title"
              className="text-lg sm:text-xl font-extrabold text-[#202020] tracking-tight text-balance"
            >
              Explore Available Students
            </h2>
            <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
              Select a campus day and timetable period to find free teammates.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close explore available students"
            className="w-9 h-9 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF0F1] border border-[#EAE6E1] text-[#555555] hover:text-[#E63946] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Day & Period Selection Controls */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#EAE6E1] bg-[#FAF8F5]/75 space-y-3.5">
          {/* 1. Day selection (Mon - Sat only) */}
          <div>
            <p className="text-[11px] font-bold text-[#5F6368] mb-2">
              Select Working Day
            </p>
            <div
              role="radiogroup"
              aria-label="Working day"
              className="flex flex-wrap gap-2"
            >
              {WEEKDAYS.map((day) => {
                const isSelected = day.id === selectedWeekday.id;
                return (
                  <button
                    key={day.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedDayId(day.id)}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E63946] ${
                      isSelected
                        ? 'bg-[#E63946] text-white border border-[#E63946] shadow-sm'
                        : 'bg-[#FAF8F5] text-[#202020] border border-[#EAE6E1] hover:bg-white hover:border-[#D4CEC6]'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Time-slot selection */}
          <div>
            <p className="text-[11px] font-bold text-[#5F6368] mb-2">
              Select Timetable Period
            </p>
            <div
              role="radiogroup"
              aria-label="Timetable period"
              className="flex flex-wrap gap-2"
            >
              {TIME_SLOTS.map((slot) => {
                const isSelected = slot.id === selectedSlot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 tabular-nums cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E63946] ${
                      isSelected
                        ? 'bg-[#E63946] text-white border border-[#E63946] shadow-sm'
                        : 'bg-[#FAF8F5] text-[#202020] border border-[#EAE6E1] hover:bg-white hover:border-[#D4CEC6]'
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day & Period Summary Bar */}
        <div className="px-5 sm:px-6 py-2.5 border-b border-[#EAE6E1] bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-[#202020] font-semibold">
            <CalendarDays className="w-3.5 h-3.5 text-[#E63946] shrink-0" />
            <span>{selectedWeekday.label}</span>
            <span aria-hidden="true" className="text-[#D4CEC6]">
              ·
            </span>
            <Clock className="w-3.5 h-3.5 text-[#E63946] shrink-0" />
            <span className="tabular-nums">{selectedSlot.label}</span>
          </div>

          {!isLoading && !error && (
            <span className="text-[11px] font-bold text-[#5F6368] tabular-nums">
              {matchingStudents.length}{' '}
              {matchingStudents.length === 1 ? 'student' : 'students'} available
            </span>
          )}
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {/* Missing Timetable Notice when current user hasn't saved a timetable */}
          {!isLoading && !error && !hasAnyTimetableData && qualifiedStudents.length > 0 && (
            <div className="rounded-xl bg-[#FFF0F1] border border-[#E63946]/25 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <p className="text-xs text-[#202020] leading-relaxed">
                Availability cannot be calculated because timetable data is missing. Submit your timetable to share your free periods too.
              </p>
              <Link
                to="/timetable"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E63946] text-white text-xs font-bold shrink-0 w-fit whitespace-nowrap"
              >
                <span>Timetable Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {error ? (
            /* Error State with Retry */
            <div
              role="alert"
              className="rounded-2xl bg-[#FFF0F1] border border-[#E63946]/25 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#E63946] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#202020]">
                    Unable to load student availability
                  </p>
                  <p className="text-xs text-[#5F6368] mt-0.5">{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRetry}
                className="px-4 py-2 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 w-fit cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : isLoading ? (
            /* Loading Skeleton Cards */
            <div className="space-y-2.5" aria-label="Loading available students">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 flex items-center justify-between gap-3 animate-pulse"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-full bg-[#EAE6E1] shrink-0" />
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="h-3.5 w-36 max-w-full rounded bg-[#EAE6E1]" />
                      <div className="h-3 w-48 max-w-full rounded bg-[#EAE6E1]" />
                      <div className="h-3 w-28 rounded bg-[#EAE6E1]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-[#EAE6E1]" />
                    <div className="w-9 h-9 rounded-xl bg-[#EAE6E1]" />
                  </div>
                </div>
              ))}
            </div>
          ) : !hasAnyTimetableData && qualifiedStudents.length === 0 ? (
            /* No Timetable Data State */
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-7 text-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#EAE6E1] text-[#E63946] flex items-center justify-center mx-auto">
                <CalendarDays className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-[#202020]">
                Availability cannot be calculated because timetable data is missing.
              </p>
              <p className="text-xs text-[#5F6368] max-w-md mx-auto leading-relaxed">
                Add and save your classes in the Timetable Builder so your free periods and peer availability can be calculated.
              </p>
              <Link
                to="/timetable"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold transition-colors"
              >
                <span>Open Timetable Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : matchingStudents.length === 0 ? (
            /* Empty Results State */
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-7 text-center space-y-2">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#EAE6E1] text-[#E63946] flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-[#202020]">
                No students are available during this time. Try another period.
              </p>
              <p className="text-xs text-[#5F6368] max-w-md mx-auto leading-relaxed">
                No verified, opted-in IDEA LAB members have an open slot on{' '}
                <span className="font-semibold text-[#202020]">{selectedWeekday.label}</span>{' '}
                during{' '}
                <span className="font-semibold text-[#202020] tabular-nums">
                  {selectedSlot.label}
                </span>
                .
              </p>
            </div>
          ) : (
            /* Compact Profile Cards */
            <div className="space-y-2.5">
              {matchingStudents.map((student) => {
                const name = student.fullName || 'IDEA Lab Member';
                const telHref = sanitizePhoneForTel(student.phoneNumber);
                const waHref = sanitizePhoneForWhatsApp(
                  student.whatsappNumber || student.phoneNumber
                );
                const isSelf = student.uid === currentUid;

                return (
                  <article
                    key={student.uid}
                    className="rounded-2xl bg-[#FAF8F5] hover:bg-white border border-[#EAE6E1] px-4 py-3.5 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <StudentAvatar
                        name={name}
                        photoURL={student.photoURL}
                        avatarPresetId={student.avatarPresetId}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-[#202020] truncate">
                            {name}
                            {isSelf && (
                              <span className="ml-1.5 text-[11px] font-semibold text-[#777777]">
                                (You)
                              </span>
                            )}
                          </h3>

                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAF8EE] text-[#177E48] text-[10px] font-bold shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#32B878]" />
                            <span>Available</span>
                          </span>
                        </div>

                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#5F6368]">
                          {student.department && (
                            <span className="truncate">{student.department}</span>
                          )}
                          {student.department && student.academicYear && (
                            <span aria-hidden="true">·</span>
                          )}
                          {student.academicYear && (
                            <span className="whitespace-nowrap">{student.academicYear}</span>
                          )}
                        </div>

                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#202020] tabular-nums">
                          <Clock className="w-3 h-3 text-[#177E48] shrink-0" />
                          <span>
                            {selectedWeekday.shortLabel} · {selectedSlot.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Direct Phone & WhatsApp Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {telHref ? (
                        <a
                          href={telHref}
                          aria-label={`Call ${name}`}
                          title={`Call ${name}`}
                          className="w-10 h-10 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] hover:border-[#E63946]/40 text-[#202020] hover:text-[#E63946] flex items-center justify-center transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-label={`Phone number unavailable for ${name}`}
                          title="Phone number not provided"
                          className="w-10 h-10 rounded-xl bg-white border border-[#EAE6E1] text-[#999999] opacity-40 cursor-not-allowed flex items-center justify-center"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      )}

                      {waHref ? (
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Message ${name} on WhatsApp`}
                          title={`Message ${name} on WhatsApp`}
                          className="w-10 h-10 rounded-xl bg-[#EAF8EE] hover:bg-[#D9F3E1] border border-[#C5E9D1] text-[#177E48] flex items-center justify-center transition-colors"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-label={`WhatsApp unavailable for ${name}`}
                          title="WhatsApp number not provided"
                          className="w-10 h-10 rounded-xl bg-white border border-[#EAE6E1] text-[#999999] opacity-40 cursor-not-allowed flex items-center justify-center"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#EAE6E1] bg-[#FAF8F5] flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#777777]">
            Verified &amp; opted-in IDEA LAB students · Mon–Sat timetable
          </span>
          <Link
            to="/timetable"
            onClick={onClose}
            className="text-xs font-bold text-[#E63946] hover:underline whitespace-nowrap"
          >
            Update Timetable →
          </Link>
        </div>
      </div>
    </div>
  );
};
