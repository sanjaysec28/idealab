import {
  StudentAvailabilityDoc,
  StudentTimetableDoc,
  TIME_SLOTS,
  TimeSlotId,
  TimeSlotOption,
  TOTAL_WEEKLY_PERIODS,
  TimetableClassEntry,
  TimetableFreeSlotDetail,
  TimetableSubmissionRecord,
  TimetableSummaryMetrics,
  WEEKDAYS,
  WeekdayId,
  WeekdayOption,
} from '../types/timetable';

export type TimetableGridMap = Record<string, TimetableClassEntry | undefined>;

export function getCellKey(day: WeekdayId, slotId: TimeSlotId): string {
  return `${day}::${slotId}`;
}

export function buildTimetableGridMap(classes: TimetableClassEntry[]): TimetableGridMap {
  const map: TimetableGridMap = {};
  for (const cls of classes) {
    for (const day of cls.days) {
      const slots = cls.scheduleByDay[day] ?? [];
      for (const slotId of slots) {
        const key = getCellKey(day, slotId);
        if (!map[key]) {
          map[key] = cls;
        }
      }
    }
  }
  return map;
}

export function calculateTimetableSummary(
  classes: TimetableClassEntry[]
): TimetableSummaryMetrics {
  const uniqueOccupiedCells = new Set<string>();
  const activeDays = new Set<WeekdayId>();

  for (const cls of classes) {
    for (const day of cls.days) {
      const slots = cls.scheduleByDay[day] ?? [];
      for (const slotId of slots) {
        if (
          WEEKDAYS.some((d) => d.id === day) &&
          TIME_SLOTS.some((s) => s.id === slotId)
        ) {
          uniqueOccupiedCells.add(getCellKey(day, slotId));
          activeDays.add(day);
        }
      }
    }
  }

  const totalSubjects = classes.length;
  const totalClasses = uniqueOccupiedCells.size;
  const freePeriods = Math.max(0, TOTAL_WEEKLY_PERIODS - totalClasses);
  const utilizationPercent = Math.round((totalClasses / TOTAL_WEEKLY_PERIODS) * 100);

  return {
    totalSubjects,
    classDays: activeDays.size,
    totalClasses,
    totalPossiblePeriods: TOTAL_WEEKLY_PERIODS,
    freePeriods,
    utilizationPercent,
  };
}

export function calculateDerivedAvailability(params: {
  uid: string;
  classes: TimetableClassEntry[];
  timetableVersion: number;
  isOptedIn: boolean;
}): Omit<StudentAvailabilityDoc, 'updatedAt'> {
  const gridMap = buildTimetableGridMap(params.classes);
  const freeSlots: TimetableFreeSlotDetail[] = [];

  for (const day of WEEKDAYS) {
    for (const slot of TIME_SLOTS) {
      if (!gridMap[getCellKey(day.id, slot.id)]) {
        freeSlots.push({
          day: day.id,
          slotId: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          label: slot.label,
        });
      }
    }
  }

  const totalFreePeriods = freeSlots.length;
  const totalOccupiedPeriods = TOTAL_WEEKLY_PERIODS - totalFreePeriods;
  const utilizationPercentage = Math.round((totalOccupiedPeriods / TOTAL_WEEKLY_PERIODS) * 100);

  return {
    uid: params.uid,
    freeSlots,
    totalFreePeriods,
    totalOccupiedPeriods,
    utilizationPercentage,
    isOptedIn: Boolean(params.isOptedIn),
    hasSubmittedTimetable: params.classes.length > 0,
    timetableVersion: params.timetableVersion,
  };
}

export function formatClassScheduleSummary(cls: TimetableClassEntry): string {
  const dayNames = WEEKDAYS.filter((d) => (cls.scheduleByDay[d.id]?.length ?? 0) > 0).map(
    (d) => d.shortLabel
  );
  const slotCount = cls.days.reduce(
    (sum, day) => sum + (cls.scheduleByDay[day]?.length ?? 0),
    0
  );
  if (dayNames.length === 0) return 'No slots selected';
  return `${dayNames.join(', ')} • ${slotCount} ${slotCount === 1 ? 'period' : 'periods'}`;
}

const JS_DAY_TO_WEEKDAY_ID: Record<number, WeekdayId | null> = {
  0: null, // Sunday
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

export function getCurrentCampusWeekdayId(date: Date = new Date()): WeekdayId | null {
  return JS_DAY_TO_WEEKDAY_ID[date.getDay()] ?? null;
}

export function getFreeSlotsForDay(
  classes: TimetableClassEntry[],
  dayId: WeekdayId
): TimeSlotOption[] {
  const gridMap = buildTimetableGridMap(classes);
  return TIME_SLOTS.filter((slot) => !gridMap[getCellKey(dayId, slot.id)]);
}

export interface TodayFreeSlotsResult {
  weekday: WeekdayOption | null;
  isSunday: boolean;
  freeSlots: TimeSlotOption[];
}

export function getTodayFreeSlots(
  classes: TimetableClassEntry[],
  date: Date = new Date()
): TodayFreeSlotsResult {
  const weekdayId = getCurrentCampusWeekdayId(date);
  if (!weekdayId) {
    return {
      weekday: null,
      isSunday: true,
      freeSlots: [],
    };
  }
  const weekday = WEEKDAYS.find((d) => d.id === weekdayId) ?? null;
  return {
    weekday,
    isSunday: false,
    freeSlots: getFreeSlotsForDay(classes, weekdayId),
  };
}

export function getTodayFreeSlotsFromAvailability(
  availability: StudentAvailabilityDoc | null,
  date: Date = new Date()
): TodayFreeSlotsResult {
  const weekdayId = getCurrentCampusWeekdayId(date);
  if (!weekdayId) {
    return {
      weekday: null,
      isSunday: true,
      freeSlots: [],
    };
  }
  const weekday = WEEKDAYS.find((d) => d.id === weekdayId) ?? null;
  if (!availability || !availability.hasSubmittedTimetable) {
    return {
      weekday,
      isSunday: false,
      freeSlots: [],
    };
  }

  const slotIdsForToday = new Set(
    availability.freeSlots
      .filter((entry) => entry.day === weekdayId)
      .map((entry) => entry.slotId)
  );

  return {
    weekday,
    isSunday: false,
    freeSlots: TIME_SLOTS.filter((slot) => slotIdsForToday.has(slot.id)),
  };
}

/**
 * Determines whether a student has a real submitted timetable persisted in Firestore.
 */
export function hasValidStudentTimetable(params: {
  timetableDoc?: StudentTimetableDoc | null;
  lastSubmission?: TimetableSubmissionRecord | null;
}): boolean {
  if (
    params.timetableDoc &&
    params.timetableDoc.submissionStatus === 'submitted' &&
    Array.isArray(params.timetableDoc.classes) &&
    params.timetableDoc.classes.length > 0
  ) {
    return true;
  }
  if (params.lastSubmission && params.lastSubmission.classes.length > 0) {
    return true;
  }
  return false;
}
