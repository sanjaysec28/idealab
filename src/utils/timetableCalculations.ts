import {
  TIME_SLOTS,
  TimeSlotId,
  TOTAL_WEEKLY_PERIODS,
  TimetableClassEntry,
  TimetableSummaryMetrics,
  WEEKDAYS,
  WeekdayId,
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
