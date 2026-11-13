import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Loader2,
  Users,
  X,
} from 'lucide-react';
import {
  StudentAvailabilityDoc,
  TIME_SLOTS,
  TimeSlotId,
  TimeSlotOption,
  WeekdayOption,
} from '../../types/timetable';
import { resolveProfileAvatarUrl } from '../../utils/assets';
import { SafeMediaImage } from './SafeMediaImage';

interface AvailabilityDiscoveryModalProps {
  isOpen: boolean;
  initialTab: 'students' | 'common-slot';
  hasValidTimetable: boolean;
  todayWeekday: WeekdayOption | null;
  isSunday: boolean;
  todayFreeSlots: TimeSlotOption[];
  availablePeers: StudentAvailabilityDoc[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export const AvailabilityDiscoveryModal: React.FC<AvailabilityDiscoveryModalProps> = ({
  isOpen,
  initialTab,
  hasValidTimetable,
  todayWeekday,
  isSunday,
  todayFreeSlots,
  availablePeers,
  isLoading,
  error,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'common-slot'>(initialTab);
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<TimeSlotId | 'all'>('all');
  const [connectedPeerId, setConnectedPeerId] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSelectedSlotFilter('all');
      setConnectedPeerId(null);
    }
  }, [isOpen, initialTab]);

  const myTodayFreeSlotIds = useMemo(
    () => new Set(todayFreeSlots.map((slot) => slot.id)),
    [todayFreeSlots]
  );

  const peersWithDisplaySlots = useMemo(() => {
    return availablePeers.map((peer) => {
      const slotsForTargetDay = todayWeekday
        ? peer.freeSlots.filter((entry) => entry.day === todayWeekday.id)
        : peer.freeSlots;

      const uniqueSlotIds = Array.from(new Set(slotsForTargetDay.map((s) => s.slotId)));
      const commonSlotIds = uniqueSlotIds.filter((id) => myTodayFreeSlotIds.has(id));

      return {
        peer,
        daySlotIds: uniqueSlotIds,
        commonSlotIds,
      };
    });
  }, [availablePeers, myTodayFreeSlotIds, todayWeekday]);

  const filteredPeers = useMemo(() => {
    if (activeTab === 'common-slot') {
      if (!hasValidTimetable || isSunday || todayFreeSlots.length === 0) {
        return [];
      }
      return peersWithDisplaySlots.filter(({ commonSlotIds }) => {
        if (commonSlotIds.length === 0) return false;
        if (selectedSlotFilter === 'all') return true;
        return commonSlotIds.includes(selectedSlotFilter);
      });
    }

    if (selectedSlotFilter === 'all') {
      return peersWithDisplaySlots.filter(({ daySlotIds }) =>
        todayWeekday ? daySlotIds.length > 0 : true
      );
    }

    return peersWithDisplaySlots.filter(({ daySlotIds }) =>
      daySlotIds.includes(selectedSlotFilter)
    );
  }, [
    activeTab,
    hasValidTimetable,
    isSunday,
    peersWithDisplaySlots,
    selectedSlotFilter,
    todayFreeSlots.length,
    todayWeekday,
  ]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Smart Availability Discovery"
        className="bg-white rounded-3xl max-w-xl w-full max-h-[85dvh] overflow-hidden border border-[#EAE6E1] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EAE6E1] flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#202124]">Smart Availability</h2>
            <p className="text-[11px] text-[#777777]">
              Opted-in verified students matched against your saved timetable
              {todayWeekday ? ` · ${todayWeekday.label}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE9] text-[#555555] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-[#EAE6E1] pb-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab('students');
              setSelectedSlotFilter('all');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'students'
                ? 'bg-[#E63946] text-white'
                : 'bg-[#FAF8F5] text-[#555555] hover:text-[#202124]'
            }`}
          >
            Available Students ({availablePeers.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('common-slot');
              setSelectedSlotFilter('all');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'common-slot'
                ? 'bg-[#E63946] text-white'
                : 'bg-[#FAF8F5] text-[#555555] hover:text-[#202124]'
            }`}
          >
            Find Common Free Slot
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error ? (
            <div
              role="alert"
              className="rounded-2xl bg-[#FFF0F1] border border-[#E63946]/25 p-4 flex items-start gap-2.5 text-xs text-[#E63946]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Unable to load availability records</p>
                <p className="text-[11px] mt-0.5 text-[#555555]">{error}</p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-6 flex items-center justify-center gap-2.5 text-xs text-[#777777]">
              <Loader2 className="w-4 h-4 animate-spin text-[#E63946]" />
              <span>Loading opted-in student availability...</span>
            </div>
          ) : activeTab === 'common-slot' && !hasValidTimetable ? (
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-5 text-center space-y-3">
              <CalendarDays className="w-8 h-8 text-[#E63946] mx-auto" />
              <div>
                <p className="text-sm font-bold text-[#202124]">
                  Your timetable isn&apos;t available yet
                </p>
                <p className="text-xs text-[#777777] mt-1">
                  Add and submit your classes in the Timetable Builder to match your free periods with opted-in teammates.
                </p>
              </div>
              <Link
                to="/timetable"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E63946] text-white text-xs font-semibold"
              >
                <span>Open Timetable Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : activeTab === 'common-slot' && isSunday ? (
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-5 text-center space-y-2">
              <CalendarDays className="w-7 h-7 text-[#777777] mx-auto" />
              <p className="text-xs font-bold text-[#202124]">
                No campus classes scheduled on Sunday
              </p>
              <p className="text-[11px] text-[#777777]">
                Common free slot comparisons run Monday through Saturday based on saved class periods.
              </p>
            </div>
          ) : activeTab === 'common-slot' && todayFreeSlots.length === 0 ? (
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-5 text-center space-y-2">
              <Clock className="w-7 h-7 text-[#777777] mx-auto" />
              <p className="text-xs font-bold text-[#202124]">
                No free periods on your schedule today
              </p>
              <p className="text-[11px] text-[#777777]">
                All periods on {todayWeekday?.label ?? 'today'} are currently occupied in your timetable.
              </p>
            </div>
          ) : (
            <>
              {/* Slot Filter Controls */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSlotFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer ${
                    selectedSlotFilter === 'all'
                      ? 'bg-[#202020] text-white'
                      : 'bg-[#FAF8F5] text-[#555555] border border-[#EAE6E1]'
                  }`}
                >
                  {activeTab === 'common-slot' ? 'All Your Free Slots' : 'All Periods'}
                </button>
                {(activeTab === 'common-slot' ? todayFreeSlots : TIME_SLOTS).map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotFilter(slot.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer tabular-nums ${
                      selectedSlotFilter === slot.id
                        ? 'bg-[#202020] text-white'
                        : 'bg-[#FAF8F5] text-[#555555] border border-[#EAE6E1]'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>

              {filteredPeers.length === 0 ? (
                <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-5 text-center space-y-1.5">
                  <p className="text-xs font-bold text-[#202124]">
                    {activeTab === 'common-slot'
                      ? 'No common free slots found right now.'
                      : 'No students are available for collaboration right now.'}
                  </p>
                  <p className="text-[11px] text-[#777777]">
                    {activeTab === 'common-slot'
                      ? 'No opted-in students share an open period matching your selected filter.'
                      : 'Students appear here only after verifying their email, submitting a timetable, and opting into collaboration.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredPeers.map(({ peer, daySlotIds, commonSlotIds }) => {
                    const peerName = peer.fullName || 'IDEA Lab Member';
                    const peerMeta = [peer.department, peer.academicYear]
                      .filter(Boolean)
                      .join(' · ') || 'Saveetha Engineering College';
                    const peerAvatar = resolveProfileAvatarUrl({
                      photoURL: peer.photoURL,
                      avatarPresetId: peer.avatarPresetId,
                    });
                    const slotsToRender =
                      activeTab === 'common-slot' ? commonSlotIds : daySlotIds;
                    const isConnected = connectedPeerId === peer.uid;

                    return (
                      <div
                        key={peer.uid}
                        className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <SafeMediaImage
                              src={peerAvatar || ''}
                              alt={peerName}
                              variant="avatar"
                              className="w-10 h-10 rounded-full object-cover border border-[#EAE6E1] shrink-0 text-xs"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#202124] truncate">
                                {peerName}
                              </p>
                              <p className="text-[11px] text-[#777777] truncate">{peerMeta}</p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {slotsToRender.map((slotId) => {
                                  const slotObj = TIME_SLOTS.find((s) => s.id === slotId);
                                  if (!slotObj) return null;
                                  const isCommon = myTodayFreeSlotIds.has(slotId);
                                  return (
                                    <span
                                      key={slotId}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold tabular-nums ${
                                        isCommon
                                          ? 'bg-[#EAF8EE] text-[#156D3F]'
                                          : 'bg-white text-[#555555] border border-[#EAE6E1]'
                                      }`}
                                    >
                                      <Clock className="w-2.5 h-2.5" />
                                      {slotObj.label}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setConnectedPeerId((prev) =>
                                prev === peer.uid ? null : peer.uid
                              )
                            }
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold shrink-0 inline-flex items-center gap-1 cursor-pointer transition-colors ${
                              isConnected
                                ? 'bg-[#EAF8EE] border-[#C9EED5] text-[#156D3F]'
                                : 'bg-white hover:bg-[#FFF0F1] border-[#EAE6E1] text-[#E63946]'
                            }`}
                          >
                            {isConnected && <Check className="w-3 h-3" />}
                            <span>{isConnected ? 'Details' : 'Connect'}</span>
                          </button>
                        </div>

                        {isConnected && (
                          <div className="pt-2 border-t border-[#EAE6E1] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                            <div className="text-[#555555]">
                              {peer.skills && peer.skills.length > 0 ? (
                                <span>Skills: {peer.skills.slice(0, 4).join(' · ')}</span>
                              ) : (
                                <span>
                                  {peer.totalFreePeriods} free weekly periods · Ready to collaborate
                                </span>
                              )}
                            </div>
                            <Link
                              to="/community"
                              onClick={onClose}
                              className="font-bold text-[#E63946] hover:underline shrink-0"
                            >
                              Find in Community →
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#EAE6E1] flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#777777]">
            Live opt-in availability · {availablePeers.length} opted-in
          </span>
          <Link
            to="/timetable"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946] hover:underline"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Update Your Timetable</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
