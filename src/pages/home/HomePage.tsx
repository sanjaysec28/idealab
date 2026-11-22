import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFriendlyFirebaseErrorMessage } from '../../firebase/errorHandling';
import {
  subscribeToOptedInAvailability,
  syncAvailabilityPublicProfile,
  updateCollaborationAvailabilityOptIn,
} from '../../services/timetableService';
import { StudentAvailabilityDoc } from '../../types/timetable';
import {
  calculateTimetableSummary,
  getCurrentPeriodStatus,
  getTodayFreeSlots,
  getTodayFreeSlotsFromAvailability,
  hasValidStudentTimetable,
} from '../../utils/timetableCalculations';
import { AvailabilityDiscoveryModal } from '../../components/home/AvailabilityDiscoveryModal';
import { CollaborationAvailabilityCard } from '../../components/home/CollaborationAvailabilityCard';
import { CommunityFeed } from '../../components/home/CommunityFeed';
import { ExploreAvailabilityModal } from '../../components/home/ExploreAvailabilityModal';
import { FreeSlotsCard } from '../../components/home/FreeSlotsCard';
import { HomeHeader } from '../../components/home/HomeHeader';
import { LeaderboardCard } from '../../components/home/LeaderboardCard';
import { LiveAvailabilityModal } from '../../components/home/LiveAvailabilityModal';
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

  const [now, setNow] = useState<Date>(() => new Date());
  const [optimisticOptIn, setOptimisticOptIn] = useState<boolean | null>(null);
  const [isSavingOptIn, setIsSavingOptIn] = useState(false);
  const [optInError, setOptInError] = useState<string | null>(null);

  const [qualifiedStudents, setQualifiedStudents] = useState<StudentAvailabilityDoc[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState<boolean>(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [availabilityRetryKey, setAvailabilityRetryKey] = useState(0);
  const syncedSignatureRef = useRef<string | null>(null);

  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isExploreModalOpen, setIsExploreModalOpen] = useState(false);
  const [discoveryModal, setDiscoveryModal] = useState<{
    isOpen: boolean;
    tab: 'students' | 'common-slot';
  }>({ isOpen: false, tab: 'common-slot' });

  // Refresh Asia/Kolkata campus period clock every 30 seconds and on tab focus
  useEffect(() => {
    const updateNow = () => setNow(new Date());
    const intervalId = window.setInterval(updateNow, 30_000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateNow();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    setOptimisticOptIn(null);
    setOptInError(null);
    syncedSignatureRef.current = null;
  }, [studentAvailability?.isOptedIn, uid]);

  const publicProfile = useMemo(
    () => ({
      fullName: studentProfile?.fullName || user?.displayName || undefined,
      department: studentProfile?.department,
      degree: studentProfile?.degree,
      academicYear: studentProfile?.currentAcademicYear || studentProfile?.academicYear,
      photoURL: studentProfile?.photoURL || user?.photoURL || undefined,
      avatarPresetId: studentProfile?.avatarPresetId,
      skills: studentProfile?.skills,
      phoneNumber: studentProfile?.phoneNumber ?? '',
      whatsappNumber: studentProfile?.whatsappNumber ?? '',
      profileComplete: Boolean(
        (studentProfile?.fullName || user?.displayName) && studentProfile?.department
      ),
    }),
    [studentProfile, user?.displayName, user?.photoURL]
  );

  useEffect(() => {
    if (!uid || !user?.emailVerified) {
      setQualifiedStudents([]);
      setIsLoadingAvailability(false);
      setAvailabilityError(null);
      return;
    }

    setIsLoadingAvailability(true);
    setAvailabilityError(null);

    const unsubscribe = subscribeToOptedInAvailability(
      uid,
      (students) => {
        setQualifiedStudents(students);
        setIsLoadingAvailability(false);
        setAvailabilityError(null);
      },
      (err) => {
        setAvailabilityError(err.message || 'Unable to load available students.');
        setIsLoadingAvailability(false);
      }
    );

    return () => unsubscribe();
  }, [availabilityRetryKey, uid, user?.emailVerified]);

  // Backfill or keep public contact & profileComplete fields synced into availability/current
  useEffect(() => {
    if (
      !uid ||
      !user?.emailVerified ||
      !studentAvailability?.hasSubmittedTimetable ||
      !studentProfile
    ) {
      return;
    }

    const needsSync =
      !studentAvailability.fullName ||
      studentAvailability.profileComplete !== publicProfile.profileComplete ||
      (studentAvailability.phoneNumber ?? '') !== (publicProfile.phoneNumber ?? '') ||
      (studentAvailability.whatsappNumber ?? '') !== (publicProfile.whatsappNumber ?? '');

    if (!needsSync) return;

    const signature = JSON.stringify({
      uid,
      fullName: publicProfile.fullName ?? '',
      phoneNumber: publicProfile.phoneNumber ?? '',
      whatsappNumber: publicProfile.whatsappNumber ?? '',
      profileComplete: publicProfile.profileComplete,
    });

    if (syncedSignatureRef.current === signature) {
      return;
    }

    syncedSignatureRef.current = signature;
    void syncAvailabilityPublicProfile(uid, publicProfile).catch(() => {
      // Non-fatal metadata backfill
    });
  }, [
    publicProfile,
    studentAvailability?.fullName,
    studentAvailability?.hasSubmittedTimetable,
    studentAvailability?.phoneNumber,
    studentAvailability?.profileComplete,
    studentAvailability?.whatsappNumber,
    studentProfile,
    uid,
    user?.emailVerified,
  ]);

  const currentPeriod = useMemo(() => getCurrentPeriodStatus(now), [now]);

  const studentsFreeNow = useMemo(() => {
    if (
      currentPeriod.kind !== 'active_period' ||
      !currentPeriod.weekdayId ||
      !currentPeriod.activeSlot
    ) {
      return [];
    }

    const dayId = currentPeriod.weekdayId;
    const slotId = currentPeriod.activeSlot.id;

    return qualifiedStudents
      .filter((student) =>
        student.freeSlots.some((entry) => entry.day === dayId && entry.slotId === slotId)
      )
      .sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
  }, [currentPeriod.activeSlot, currentPeriod.kind, currentPeriod.weekdayId, qualifiedStudents]);

  const availablePeers = useMemo(
    () => qualifiedStudents.filter((student) => student.uid !== uid),
    [qualifiedStudents, uid]
  );

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
      return getTodayFreeSlotsFromAvailability(studentAvailability, now);
    }
    return getTodayFreeSlots(hasValidTimetable ? classes : [], now);
  }, [classes, hasValidTimetable, now, studentAvailability]);

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
        getFriendlyFirebaseErrorMessage(
          err,
          'Unable to update collaboration availability right now.'
        )
      );
    } finally {
      setIsSavingOptIn(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-[#202124] flex flex-col">
      <HomeHeader />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,74fr)_minmax(290px,26fr)] gap-5 items-start">
          {/* LEFT / MAIN AREA (~74%) */}
          <div className="space-y-5 min-w-0">
            <SmartAvailabilityHero
              studentsFreeNowCount={studentsFreeNow.length}
              currentPeriod={currentPeriod}
              isLoadingAvailability={isLoadingAvailability}
              availabilityError={availabilityError}
              onRetryAvailability={() => setAvailabilityRetryKey((prev) => prev + 1)}
              onOpenLiveAvailability={() => setIsLiveModalOpen(true)}
              onExploreAvailableStudents={() => setIsExploreModalOpen(true)}
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

      <LiveAvailabilityModal
        isOpen={isLiveModalOpen}
        currentUid={uid}
        qualifiedStudents={qualifiedStudents}
        currentPeriod={currentPeriod}
        hasValidTimetable={hasValidTimetable}
        isCurrentUserOptedIn={isOptedIn}
        isLoading={isLoadingAvailability}
        error={availabilityError}
        onRetry={() => setAvailabilityRetryKey((prev) => prev + 1)}
        onClose={() => setIsLiveModalOpen(false)}
      />

      <ExploreAvailabilityModal
        isOpen={isExploreModalOpen}
        currentUid={uid}
        qualifiedStudents={qualifiedStudents}
        currentPeriod={currentPeriod}
        hasValidTimetable={hasValidTimetable}
        isLoading={isLoadingAvailability}
        error={availabilityError}
        onRetry={() => setAvailabilityRetryKey((prev) => prev + 1)}
        onClose={() => setIsExploreModalOpen(false)}
      />

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
