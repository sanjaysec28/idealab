import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock, Users, X } from 'lucide-react';
import { HOME_DEMO_AVAILABLE_STUDENTS } from '../../data/homeDemoData';
import { TIME_SLOTS, TimeSlotId, TimeSlotOption } from '../../types/timetable';
import { SafeMediaImage } from './SafeMediaImage';

interface AvailabilityDiscoveryModalProps {
  isOpen: boolean;
  initialTab: 'students' | 'common-slot';
  hasValidTimetable: boolean;
  todayFreeSlots: TimeSlotOption[];
  onClose: () => void;
}

export const AvailabilityDiscoveryModal: React.FC<AvailabilityDiscoveryModalProps> = ({
  isOpen,
  initialTab,
  hasValidTimetable,
  todayFreeSlots,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'common-slot'>(initialTab);
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<TimeSlotId | 'all'>('all');

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSelectedSlotFilter('all');
    }
  }, [isOpen, initialTab]);

  const myFreeSlotIds = useMemo(
    () => new Set(todayFreeSlots.map((slot) => slot.id)),
    [todayFreeSlots]
  );

  const filteredStudents = useMemo(() => {
    if (activeTab === 'common-slot' && hasValidTimetable && todayFreeSlots.length > 0) {
      return HOME_DEMO_AVAILABLE_STUDENTS.filter((peer) =>
        peer.freeSlotIds.some((slotId) =>
          selectedSlotFilter === 'all'
            ? myFreeSlotIds.has(slotId)
            : slotId === selectedSlotFilter && myFreeSlotIds.has(slotId)
        )
      );
    }

    if (selectedSlotFilter === 'all') {
      return HOME_DEMO_AVAILABLE_STUDENTS;
    }

    return HOME_DEMO_AVAILABLE_STUDENTS.filter((peer) =>
      peer.freeSlotIds.includes(selectedSlotFilter)
    );
  }, [activeTab, hasValidTimetable, myFreeSlotIds, selectedSlotFilter, todayFreeSlots.length]);

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
            <h2 className="text-base font-bold text-[#202124]">Smart Availability Preview</h2>
            <p className="text-[11px] text-[#777777]">
              Sample opted-in teammates compared against your timetable free slots
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
            onClick={() => setActiveTab('students')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'students'
                ? 'bg-[#E63946] text-white'
                : 'bg-[#FAF8F5] text-[#555555] hover:text-[#202124]'
            }`}
          >
            Available Students (Demo)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('common-slot')}
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
          {activeTab === 'common-slot' && !hasValidTimetable ? (
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
          ) : (
            <>
              {/* Slot Filter Pills */}
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

              {filteredStudents.length === 0 ? (
                <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4 text-center text-xs text-[#777777]">
                  No sample teammates match that period filter.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredStudents.map((peer) => (
                    <div
                      key={peer.id}
                      className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <SafeMediaImage
                          src={peer.avatar}
                          alt={peer.name}
                          variant="avatar"
                          className="w-10 h-10 rounded-full object-cover border border-[#EAE6E1] shrink-0 text-xs"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#202124] truncate">{peer.name}</p>
                          <p className="text-[11px] text-[#777777] truncate">{peer.departmentYear}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {peer.freeSlotIds.map((slotId) => {
                              const slotObj = TIME_SLOTS.find((s) => s.id === slotId);
                              if (!slotObj) return null;
                              const isCommon = myFreeSlotIds.has(slotId);
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

                      <Link
                        to="/community"
                        onClick={onClose}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-[11px] font-bold text-[#E63946] shrink-0"
                      >
                        Connect
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#EAE6E1] flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#777777]">
            Opt-in preview · Sample student entries
          </span>
          <Link
            to="/community"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E63946] hover:underline"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Browse Full Community</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
