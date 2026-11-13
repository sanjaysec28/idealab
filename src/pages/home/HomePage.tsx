import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeToOptedInAvailability,
  syncAvailabilityPublicProfile,
  updateCollaborationAvailabilityOptIn,
} from '../../services/timetableService';
import { StudentAvailabilityDoc } from '../../types/timetable';
import {
  calculateTimetableSummary,
  getTodayFreeSlots,
  getTodayFreeSlotsFromAvailability,
  hasValidStudentTimetable,
} from '../../utils/timetableCalculations';
import { AvailabilityDiscoveryModal } from '../../components/home/AvailabilityDiscoveryModal';
import { CollaborationAvailabilityCard } from '../../components/home/CollaborationAvailabilityCard';
import { CommunityFeed } from '../../components/home/CommunityFeed';
import { FreeSlotsCard } from '../../components/home/FreeSlotsCard';
import { HomeHeader } from '../../components/home/HomeHeader';
import { LeaderboardCard } from '../../components/home/LeaderboardCard';
import { MobileBottomNavigation } from '../../components/home/MobileBottomNavigation';
import { QuickActions } from '../../components/home/QuickActions';
import { SmartAvailabilityHero } from '../../components/home/SmartAvailabilityHero';
import { TrendingProjects } from '../../components/home/TrendingProjects';
import { UpcomingEvents } from '../../components/home/UpcomingEvents';

export const HomePage: React.FC = () => {
  const {
    user,
    studentProfile,
    studentTimetable,
    studentAvailability,
    refreshStudentData,
  } = useAuth();
  const uid = user?.uid || '';

  const [optimisticOptIn, setOptimisticOptIn] = useState<boolean | null>(null);
  const [isSavingOptIn, setIsSavingOptIn] = useState(false);
  const [optInError, setOptInError] = useState<string | null>(null);

  const [availablePeers, setAvailablePeers] = useState<StudentAvailabilityDoc[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const hasSyncedPublicProfileRef = useRef(false);

  const [discoveryModal, setDiscoveryModal] = useState<{
    isOpen: boolean;
    tab: 'students' | 'common-slot';
  }>({ isOpen: false, tab: 'students' });

  useEffect(() => {
    setOptimisticOptIn(null);
    setOptInError(null);
    hasSyncedPublicProfileRef.current = false;
  }, [studentAvailability?.isOptedIn, uid]);

  const publicProfile = useMemo(
    () => ({
      fullName: studentProfile?.fullName || user?.displayName || undefined,
      department: studentProfile?.department,
      academicYear: studentProfile?.currentAcademicYear || studentProfile?.academicYear,
      photoURL: studentProfile?.photoURL || user?.photoURL || undefined,
      avatarPresetId: studentProfile?.avatarPresetId,
      skills: studentProfile?.skills,
    }),
    [studentProfile, user?.displayName, user?.photoURL]
  );

  useEffect(() => {
    if (!uid || !user?.emailVerified) {
      setAvailablePeers([]);
      setIsLoadingAvailability(false);
      setAvailabilityError(null);
      return;
    }

    setIsLoadingAvailability(true);
    setAvailabilityError(null);

    const unsubscribe = subscribeToOptedInAvailability(
      uid,
      (peers) => {
        setAvailablePeers(peers);
        setIsLoadingAvailability(false);
      },
      (err) => {
        setAvailabilityError(err.message || 'Unable to load available students.');
        setIsLoadingAvailability(false);
      }
    );

    return () => unsubscribe();
  }, [uid, user?.emailVerified]);

  useEffect(() => {
    if (
      !uid ||
      !user?.emailVerified ||
      hasSyncedPublicProfileRef.current ||
      !studentAvailability?.hasSubmittedTimetable ||
      studentAvailability.fullName ||
      !studentProfile
    ) {
      return;
    }

    hasSyncedPublicProfileRef.current = true;
    void syncAvailabilityPublicProfile(uid, publicProfile).catch(() => {
      // Non-fatal metadata backfill
    });
  }, [
    publicProfile,
    studentAvailability?.fullName,
    studentAvailability?.hasSubmittedTimetable,
    studentProfile,
    uid,
    user?.emailVerified,
  ]);

  const classes = studentTimetable?.classes ?? [];

  const hasValidTimetable = useMemo(
    () =>
      hasValidStudentTimetable({
        timetableDoc: studentTimetable,
      }),
    [studentTimetable]
  );

  const todaySlotsInfo = useMemo(() => {
    if (studentAvailability && studentAvailability.hasSubmittedTimetable) {
      return getTodayFreeSlotsFromAvailability(studentAvailability);
    }
    return getTodayFreeSlots(hasValidTimetable ? classes : []);
  }, [classes, hasValidTimetable, studentAvailability]);

  const weeklySummary = useMemo(
    () => calculateTimetableSummary(hasValidTimetable ? classes : []),
    [classes, hasValidTimetable]
  );

  const totalWeeklyFreePeriods =
    studentAvailability?.totalFreePeriods ?? weeklySummary.freePeriods;

  const hasFreePeriods =
    todaySlotsInfo.freeSlots.length > 0 || totalWeeklyFreePeriods > 0;

  const isOptedIn =
    optimisticOptIn !== null
      ? optimisticOptIn
      : Boolean(studentAvailability?.isOptedIn);

  const todayCommonSlotsCount = useMemo(() => {
    if (
      !hasValidTimetable ||
      todaySlotsInfo.isSunday ||
      !todaySlotsInfo.weekday ||
      todaySlotsInfo.freeSlots.length === 0 ||
      availablePeers.length === 0
    ) {
      return 0;
    }

    const targetDayId = todaySlotsInfo.weekday.id;
    let count = 0;

    for (const mySlot of todaySlotsInfo.freeSlots) {
      const hasPeerWithSameSlot = availablePeers.some((peer) =>
        peer.freeSlots.some(
          (peerSlot) => peerSlot.day === targetDayId && peerSlot.slotId === mySlot.id
        )
      );
      if (hasPeerWithSameSlot) {
        count += 1;
      }
    }

    return count;
  }, [
    availablePeers,
    hasValidTimetable,
    todaySlotsInfo.freeSlots,
    todaySlotsInfo.isSunday,
    todaySlotsInfo.weekday,
  ]);

  const handleToggleAvailability = async (nextValue: boolean) => {
    if (!uid || !hasValidTimetable || isSavingOptIn) return;
    setOptInError(null);
    setOptimisticOptIn(nextValue);
    setIsSavingOptIn(true);
    try {
      await updateCollaborationAvailabilityOptIn(uid, nextValue, publicProfile);
      await refreshStudentData();
      setOptimisticOptIn(null);
    } catch (err) {
      setOptimisticOptIn(null);
      setOptInError(
        err instanceof Error
          ? err.message
          : 'Unable to update collaboration availability right now.'
      );
    } finally {
      setIsSavingOptIn(false);
    }
  };

  const liveAvailableStudentsCount = availablePeers.length;

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-[#202124] flex flex-col">
      <HomeHeader />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,74fr)_minmax(290px,26fr)] gap-5 items-start">
          {/* LEFT / MAIN AREA (~74%) */}
          <div className="space-y-5 min-w-0">
            <SmartAvailabilityHero
              availableStudentsCount={liveAvailableStudentsCount}
              yourFreePeriodsCount={todaySlotsInfo.freeSlots.length}
              commonSlotsCount={todayCommonSlotsCount}
              isLoadingAvailability={isLoadingAvailability}
              hasValidTimetable={hasValidTimetable}
              onExploreAvailableStudents={() =>
                setDiscoveryModal({ isOpen: true, tab: 'students' })
              }
              onFindCommonFreeSlot={() =>
                setDiscoveryModal({ isOpen: true, tab: 'common-slot' })
              }
            />

            {/* On Mobile, surface opt-in Availability & Free Slots cleanly right after hero */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              <CollaborationAvailabilityCard
                isOptedIn={isOptedIn}
                isSaving={isSavingOptIn}
                saveError={optInError}
                hasValidTimetable={hasValidTimetable}
                hasFreePeriodTodayOrWeekly={hasFreePeriods}
                onToggle={(next) => void handleToggleAvailability(next)}
              />
              <FreeSlotsCard
                hasValidTimetable={hasValidTimetable}
                weekday={todaySlotsInfo.weekday}
                isSunday={todaySlotsInfo.isSunday}
                freeSlots={todaySlotsInfo.freeSlots}
              />
            </div>

            <QuickActions />

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] gap-5 items-start">
              <TrendingProjects />
              <CommunityFeed />
            </div>
          </div>

          {/* RIGHT INFORMATION COLUMN (~26%) */}
          <aside className="space-y-5 min-w-0">
            <div className="hidden lg:block space-y-5">
              <CollaborationAvailabilityCard
                isOptedIn={isOptedIn}
                isSaving={isSavingOptIn}
                saveError={optInError}
                hasValidTimetable={hasValidTimetable}
                hasFreePeriodTodayOrWeekly={hasFreePeriods}
                onToggle={(next) => void handleToggleAvailability(next)}
              />

              <FreeSlotsCard
                hasValidTimetable={hasValidTimetable}
                weekday={todaySlotsInfo.weekday}
                isSunday={todaySlotsInfo.isSunday}
                freeSlots={todaySlotsInfo.freeSlots}
              />
            </div>

            <UpcomingEvents />
            <LeaderboardCard />
          </aside>
        </div>
      </main>

      <MobileBottomNavigation />

      <AvailabilityDiscoveryModal
        isOpen={discoveryModal.isOpen}
        initialTab={discoveryModal.tab}
        hasValidTimetable={hasValidTimetable}
        todayWeekday={todaySlotsInfo.weekday}
        isSunday={todaySlotsInfo.isSunday}
        todayFreeSlots={todaySlotsInfo.freeSlots}
        availablePeers={availablePeers}
        isLoading={isLoadingAvailability}
        error={availabilityError}
        onClose={() => setDiscoveryModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
