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
} from '../../types/timetable';
import { resolveProfileAvatarUrl } from '../../utils/assets';
import {
  CurrentPeriodStatus,
  sanitizePhoneForTel,
  sanitizePhoneForWhatsApp,
} from '../../utils/timetableCalculations';

interface LiveAvailabilityModalProps {
  isOpen: boolean;
  currentUid: string;
  qualifiedStudents: StudentAvailabilityDoc[];
  currentPeriod: CurrentPeriodStatus;
  hasValidTimetable: boolean;
  isCurrentUserOptedIn: boolean;
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

export const LiveAvailabilityModal: React.FC<LiveAvailabilityModalProps> = ({
  isOpen,
  currentUid,
  qualifiedStudents,
  currentPeriod,
  hasValidTimetable,
  isCurrentUserOptedIn,
  isLoading,
  error,
  onRetry,
  onClose,
}) => {
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<TimeSlotId | 'all'>(
    currentPeriod.activeSlot?.id ?? 'all'
  );

  // Sync default filter when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setSelectedSlotFilter(currentPeriod.activeSlot?.id ?? 'all');
  }, [isOpen, currentPeriod.activeSlot?.id]);

  // Body scroll lock and Escape-to-close while modal is open
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

  const isCampusDay =
    currentPeriod.kind !== 'weekend' &&
    currentPeriod.kind !== 'holiday' &&
    Boolean(currentPeriod.weekdayId);

  // Precompute each student's free slot IDs for today's campus weekday
  const enrichedStudents = useMemo(() => {
    const weekdayId = currentPeriod.weekdayId;
    const activeSlotId =
      currentPeriod.kind === 'active_period' ? currentPeriod.activeSlot?.id ?? null : null;

    if (!isCampusDay || !weekdayId) {
      return [];
    }

    return qualifiedStudents
      .map((student) => {
        const todaySlotSet = new Set<TimeSlotId>();
        for (const entry of student.freeSlots) {
          if (entry.day === weekdayId) {
            todaySlotSet.add(entry.slotId);
          }
        }
        const todaySlots = TIME_SLOTS.filter((slot) => todaySlotSet.has(slot.id));
        const isFreeRightNow = Boolean(activeSlotId && todaySlotSet.has(activeSlotId));

        return {
          student,
          todaySlotSet,
          todaySlots,
          isFreeRightNow,
        };
      })
      .filter((item) => item.todaySlots.length > 0);
  }, [currentPeriod.activeSlot?.id, currentPeriod.kind, currentPeriod.weekdayId, isCampusDay, qualifiedStudents]);

  const studentsFreeNowCount = useMemo(
    () => enrichedStudents.filter((item) => item.isFreeRightNow).length,
    [enrichedStudents]
  );

  const slotCounts = useMemo(() => {
    const counts: Record<TimeSlotId, number> = {
      'slot-1': 0,
      'slot-2': 0,
      'slot-3': 0,
      'slot-4': 0,
    };
    for (const item of enrichedStudents) {
      for (const slot of TIME_SLOTS) {
        if (item.todaySlotSet.has(slot.id)) {
          counts[slot.id] += 1;
        }
      }
    }
    return counts;
  }, [enrichedStudents]);

  const displayedStudents = useMemo(() => {
    const filtered =
      selectedSlotFilter === 'all'
        ? enrichedStudents
        : enrichedStudents.filter((item) => item.todaySlotSet.has(selectedSlotFilter));

    return [...filtered].sort((a, b) => {
      if (a.isFreeRightNow !== b.isFreeRightNow) {
        return a.isFreeRightNow ? -1 : 1;
      }
      return (a.student.fullName || '').localeCompare(b.student.fullName || '');
    });
  }, [enrichedStudents, selectedSlotFilter]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="live-availability-modal-title"
        className="bg-white w-full sm:max-w-2xl rounded-t-[20px] sm:rounded-[20px] border border-[#EAE6E1] shadow-2xl max-h-[90dvh] sm:max-h-[85dvh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-[#EAE6E1] bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2
                  id="live-availability-modal-title"
                  className="text-lg sm:text-xl font-extrabold text-[#202020] tracking-tight"
                >
                  Students Available Now
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#EAF8EE] text-[#177E48] text-[11px] font-extrabold tracking-wide uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#32B878] animate-pulse" />
                  <span>LIVE</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
                Find teammates who are free during this period.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close live student availability modal"
              className="w-9 h-9 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF0F1] border border-[#EAE6E1] text-[#555555] hover:text-[#E63946] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Live Metadata Strip */}
          <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#5F6368] bg-[#FAF8F5] border border-[#EAE6E1] rounded-xl px-3.5 py-2">
            <span className="font-bold text-[#202020] tabular-nums">
              {studentsFreeNowCount}{' '}
              {studentsFreeNowCount === 1 ? 'student' : 'students'} free now
            </span>
            <span aria-hidden="true" className="text-[#D4CEC6]">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-[#202020]">
              <CalendarDays className="w-3.5 h-3.5 text-[#E63946]" />
              <span>{currentPeriod.weekdayLabel}</span>
            </span>
            <span aria-hidden="true" className="text-[#D4CEC6]">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-[#202020] tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[#E63946]" />
              <span>{currentPeriod.periodLabel}</span>
            </span>
          </div>
        </div>

        {/* Period Filter Bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-[#EAE6E1] bg-[#FAF8F5]/70 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              type="button"
              onClick={() => setSelectedSlotFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedSlotFilter === 'all'
                  ? 'bg-[#E63946] text-white shadow-sm'
                  : 'bg-white text-[#555555] border border-[#EAE6E1] hover:text-[#202020]'
              }`}
            >
              All Periods ({enrichedStudents.length})
            </button>

            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedSlotFilter === slot.id;
              const isLiveSlot =
                currentPeriod.kind === 'active_period' &&
                currentPeriod.activeSlot?.id === slot.id;

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlotFilter(slot.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums inline-flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#E63946] text-white shadow-sm'
                      : 'bg-white text-[#555555] border border-[#EAE6E1] hover:text-[#202020]'
                  }`}
                >
                  {isLiveSlot && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-[#32B878]'
                      }`}
                    />
                  )}
                  <span>{slot.label}</span>
                  <span
                    className={`text-[10px] font-bold ${
                      isSelected ? 'text-white/85' : 'text-[#888888]'
                    }`}
                  >
                    ({slotCounts[slot.id]})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {/* Status Prompts for Signed-in Student */}
          {!hasValidTimetable && (
            <div className="rounded-xl bg-[#FFF0F1] border border-[#E63946]/25 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <p className="text-xs text-[#202020] leading-relaxed">
                <span className="font-bold text-[#E63946]">Timetable required:</span> Submit your weekly timetable so teammates can match free periods with you.
              </p>
              <Link
                to="/timetable"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E63946] text-white text-xs font-bold shrink-0 w-fit"
              >
                <span>Timetable Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {hasValidTimetable && !isCurrentUserOptedIn && (
            <div className="rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] px-4 py-2.5 text-xs text-[#5F6368]">
              <span className="font-bold text-[#202020]">Availability paused:</span>{' '}
              Your collaboration availability toggle is off. Enable{' '}
              <span className="font-semibold text-[#202020]">
                Your Collaboration Availability
              </span>{' '}
              on the homepage to appear in live student discovery.
            </div>
          )}

          {/* Error State with Retry */}
          {error ? (
            <div
              role="alert"
              className="rounded-2xl bg-[#FFF0F1] border border-[#E63946]/25 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#E63946] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-[#202020]">
                    Unable to load live availability
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
            /* Loading Skeleton State */
            <div className="space-y-2.5" aria-label="Loading available students">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 flex items-center justify-between gap-3 animate-pulse"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-full bg-[#EAE6E1] shrink-0" />
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="h-3.5 w-40 max-w-full rounded bg-[#EAE6E1]" />
                      <div className="h-3 w-52 max-w-full rounded bg-[#EAE6E1]" />
                      <div className="h-3 w-32 rounded bg-[#EAE6E1]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-[#EAE6E1]" />
                    <div className="w-9 h-9 rounded-xl bg-[#EAE6E1]" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedStudents.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-7 text-center space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#EAE6E1] text-[#E63946] flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-[#202020]">
                No students are available for collaboration right now.
              </p>
              <p className="text-xs text-[#5F6368] max-w-md mx-auto leading-relaxed">
                {!isCampusDay
                  ? `${currentPeriod.weekdayLabel} has no scheduled campus timetable periods.`
                  : selectedSlotFilter !== 'all'
                    ? 'No verified, opted-in students have a free period during this selected slot.'
                    : 'Students appear here once they verify their email, submit their timetable, and enable collaboration availability.'}
              </p>
              {isCampusDay && selectedSlotFilter !== 'all' && enrichedStudents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSlotFilter('all')}
                  className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#E63946] cursor-pointer transition-colors"
                >
                  <span>View All Periods Today ({enrichedStudents.length})</span>
                </button>
              )}
            </div>
          ) : (
            /* Compact Horizontal Student Cards */
            <div className="space-y-2.5">
              {displayedStudents.map(({ student, todaySlots, isFreeRightNow }) => {
                const name = student.fullName || 'IDEA Lab Member';
                const academicMeta = [student.degree, student.department, student.academicYear]
                  .filter(Boolean)
                  .join(' · ');
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

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isFreeRightNow
                                ? 'bg-[#EAF8EE] text-[#177E48]'
                                : 'bg-white border border-[#EAE6E1] text-[#177E48]'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#32B878]" />
                            <span>{isFreeRightNow ? 'Free Now' : 'Free'}</span>
                          </span>
                        </div>

                        {academicMeta && (
                          <p className="text-xs text-[#5F6368] truncate mt-0.5">
                            {academicMeta}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          {todaySlots.map((slot) => {
                            const isCurrentActive =
                              currentPeriod.kind === 'active_period' &&
                              currentPeriod.activeSlot?.id === slot.id;
                            return (
                              <span
                                key={slot.id}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium tabular-nums ${
                                  isCurrentActive
                                    ? 'bg-[#EAF8EE] text-[#177E48] font-semibold'
                                    : 'bg-white border border-[#EAE6E1] text-[#5F6368]'
                                }`}
                              >
                                <Clock className="w-2.5 h-2.5 shrink-0" />
                                <span>{slot.label}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Direct Call & WhatsApp Contact Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {telHref ? (
                        <a
                          href={telHref}
                          aria-label={`Call ${name}`}
                          title={`Call ${name}`}
                          className="w-9 h-9 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] hover:border-[#E63946]/40 text-[#202020] hover:text-[#E63946] flex items-center justify-center transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-label={`Phone number unavailable for ${name}`}
                          title="Phone number not provided"
                          className="w-9 h-9 rounded-xl bg-white border border-[#EAE6E1] text-[#999999] opacity-40 cursor-not-allowed flex items-center justify-center"
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
                          className="w-9 h-9 rounded-xl bg-[#EAF8EE] hover:bg-[#D9F3E1] border border-[#C5E9D1] text-[#177E48] flex items-center justify-center transition-colors"
                        >
                          <WhatsAppIcon className="w-4 h-4" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-label={`WhatsApp unavailable for ${name}`}
                          title="WhatsApp number not provided"
                          className="w-9 h-9 rounded-xl bg-white border border-[#EAE6E1] text-[#999999] opacity-40 cursor-not-allowed flex items-center justify-center"
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
            Verified &amp; opted-in IDEA LAB students · {currentPeriod.formattedTimeIst}
          </span>
          <Link
            to="/timetable"
            onClick={onClose}
            className="text-xs font-bold text-[#E63946] hover:underline whitespace-nowrap"
          >
            View My Timetable →
          </Link>
        </div>
      </div>
    </div>
  );
};
