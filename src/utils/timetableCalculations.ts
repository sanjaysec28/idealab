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

const SHORT_WEEKDAY_TO_ID: Record<string, WeekdayId | null> = {
  Sun: null,
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
};

export interface KolkataTimeContext {
  weekdayId: WeekdayId | null;
  weekdayLabel: string;
  weekdayShort: string;
  minutesSinceMidnight: number;
  formattedTimeIst: string;
  dateKey: string;
}

export function getKolkataTimeContext(date: Date = new Date()): KolkataTimeContext {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);

    const getPart = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const weekdayShortRaw = getPart('weekday');
    const hourRaw = Number.parseInt(getPart('hour'), 10);
    const minuteRaw = Number.parseInt(getPart('minute'), 10);
    const hour = Number.isFinite(hourRaw) ? (hourRaw === 24 ? 0 : hourRaw) : date.getHours();
    const minute = Number.isFinite(minuteRaw) ? minuteRaw : date.getMinutes();

    const weekdayId =
      weekdayShortRaw in SHORT_WEEKDAY_TO_ID
        ? SHORT_WEEKDAY_TO_ID[weekdayShortRaw]
        : (JS_DAY_TO_WEEKDAY_ID[date.getDay()] ?? null);

    const weekdayObj = weekdayId ? WEEKDAYS.find((w) => w.id === weekdayId) : null;
    const weekdayLabel = weekdayObj ? weekdayObj.label : 'Sunday';
    const weekdayShort = weekdayObj ? weekdayObj.shortLabel : 'Sun';

    const formattedTimeIst = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);

    const dateKey = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;

    return {
      weekdayId,
      weekdayLabel,
      weekdayShort,
      minutesSinceMidnight: hour * 60 + minute,
      formattedTimeIst: `${formattedTimeIst} IST`,
      dateKey,
    };
  } catch {
    const weekdayId = JS_DAY_TO_WEEKDAY_ID[date.getDay()] ?? null;
    const weekdayObj = weekdayId ? WEEKDAYS.find((w) => w.id === weekdayId) : null;
    return {
      weekdayId,
      weekdayLabel: weekdayObj ? weekdayObj.label : 'Sunday',
      weekdayShort: weekdayObj ? weekdayObj.shortLabel : 'Sun',
      minutesSinceMidnight: date.getHours() * 60 + date.getMinutes(),
      formattedTimeIst: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      dateKey: date.toISOString().slice(0, 10),
    };
  }
}

export type CampusPeriodKind =
  | 'active_period'
  | 'break'
  | 'lunch'
  | 'before_hours'
  | 'after_hours'
  | 'weekend'
  | 'holiday';

export interface CurrentPeriodStatus {
  kind: CampusPeriodKind;
  weekdayId: WeekdayId | null;
  weekdayLabel: string;
  weekdayShort: string;
  activeSlot: TimeSlotOption | null;
  nextSlot: TimeSlotOption | null;
  periodLabel: string;
  statusDetail: string;
  formattedTimeIst: string;
}

const SLOT_TIME_RANGES: Array<{
  slotId: TimeSlotId;
  startMin: number;
  endMin: number;
}> = [
  { slotId: 'slot-1', startMin: 8 * 60, endMin: 9 * 60 + 30 }, // 8:00 AM - 9:30 AM
  { slotId: 'slot-2', startMin: 9 * 60 + 45, endMin: 11 * 60 + 15 }, // 9:45 AM - 11:15 AM
  { slotId: 'slot-3', startMin: 13 * 60 + 15, endMin: 14 * 60 + 45 }, // 1:15 PM - 2:45 PM
  { slotId: 'slot-4', startMin: 15 * 60, endMin: 16 * 60 + 30 }, // 3:00 PM - 4:30 PM
];

// Explicit Saveetha / Indian public holiday dates (YYYY-MM-DD in Asia/Kolkata) can be registered here
const CAMPUS_HOLIDAY_DATES = new Set<string>([]);

export function getCurrentPeriodStatus(date: Date = new Date()): CurrentPeriodStatus {
  const ctx = getKolkataTimeContext(date);
  const slot1 = TIME_SLOTS[0];
  const slot2 = TIME_SLOTS[1];
  const slot3 = TIME_SLOTS[2];
  const slot4 = TIME_SLOTS[3];

  if (CAMPUS_HOLIDAY_DATES.has(ctx.dateKey)) {
    return {
      kind: 'holiday',
      weekdayId: ctx.weekdayId,
      weekdayLabel: ctx.weekdayLabel,
      weekdayShort: ctx.weekdayShort,
      activeSlot: null,
      nextSlot: null,
      periodLabel: 'Campus Holiday',
      statusDetail: 'No scheduled classes today',
      formattedTimeIst: ctx.formattedTimeIst,
    };
  }

  if (!ctx.weekdayId) {
    return {
      kind: 'weekend',
      weekdayId: null,
      weekdayLabel: 'Sunday',
      weekdayShort: 'Sun',
      activeSlot: null,
      nextSlot: null,
      periodLabel: 'No Classes Scheduled',
      statusDetail: 'Sunday · Campus Closed',
      formattedTimeIst: ctx.formattedTimeIst,
    };
  }

  const m = ctx.minutesSinceMidnight;

  for (const range of SLOT_TIME_RANGES) {
    if (m >= range.startMin && m < range.endMin) {
      const slot = TIME_SLOTS.find((s) => s.id === range.slotId) ?? null;
      return {
        kind: 'active_period',
        weekdayId: ctx.weekdayId,
        weekdayLabel: ctx.weekdayLabel,
        weekdayShort: ctx.weekdayShort,
        activeSlot: slot,
        nextSlot: null,
        periodLabel: slot?.label ?? 'Active Period',
        statusDetail: `${ctx.weekdayLabel} · ${slot?.label ?? ''}`,
        formattedTimeIst: ctx.formattedTimeIst,
      };
    }
  }

  if (m < 8 * 60) {
    return {
      kind: 'before_hours',
      weekdayId: ctx.weekdayId,
      weekdayLabel: ctx.weekdayLabel,
      weekdayShort: ctx.weekdayShort,
      activeSlot: null,
      nextSlot: slot1,
      periodLabel: `Before Hours · First: ${slot1.label}`,
      statusDetail: `${ctx.weekdayLabel} · First period at 8:00 AM`,
      formattedTimeIst: ctx.formattedTimeIst,
    };
  }

  if (m >= 9 * 60 + 30 && m < 9 * 60 + 45) {
    return {
      kind: 'break',
      weekdayId: ctx.weekdayId,
      weekdayLabel: ctx.weekdayLabel,
      weekdayShort: ctx.weekdayShort,
      activeSlot: null,
      nextSlot: slot2,
      periodLabel: `Short Break · Next: ${slot2.label}`,
      statusDetail: `${ctx.weekdayLabel} · Morning break (9:30 – 9:45 AM)`,
      formattedTimeIst: ctx.formattedTimeIst,
    };
  }

  if (m >= 11 * 60 + 15 && m < 13 * 60 + 15) {
    return {
      kind: 'lunch',
      weekdayId: ctx.weekdayId,
      weekdayLabel: ctx.weekdayLabel,
      weekdayShort: ctx.weekdayShort,
      activeSlot: null,
      nextSlot: slot3,
      periodLabel: `Lunch Break · Next: ${slot3.label}`,
      statusDetail: `${ctx.weekdayLabel} · Lunch break (11:15 AM – 1:15 PM)`,
      formattedTimeIst: ctx.formattedTimeIst,
    };
  }

  if (m >= 14 * 60 + 45 && m < 15 * 60) {
    return {
      kind: 'break',
      weekdayId: ctx.weekdayId,
      weekdayLabel: ctx.weekdayLabel,
      weekdayShort: ctx.weekdayShort,
      activeSlot: null,
      nextSlot: slot4,
      periodLabel: `Short Break · Next: ${slot4.label}`,
      statusDetail: `${ctx.weekdayLabel} · Afternoon break (2:45 – 3:00 PM)`,
      formattedTimeIst: ctx.formattedTimeIst,
    };
  }

  return {
    kind: 'after_hours',
    weekdayId: ctx.weekdayId,
    weekdayLabel: ctx.weekdayLabel,
    weekdayShort: ctx.weekdayShort,
    activeSlot: null,
    nextSlot: null,
    periodLabel: 'Classes Ended for Today',
    statusDetail: `${ctx.weekdayLabel} · After 4:30 PM`,
    formattedTimeIst: ctx.formattedTimeIst,
  };
}

export const WHATSAPP_COLLABORATION_GREETING =
  "Hi! I found you on the IDEA LAB availability page. You're free during this period. Would you like to collaborate?";

export function sanitizePhoneForTel(rawPhone: string | undefined): string | null {
  if (!rawPhone || typeof rawPhone !== 'string') return null;
  const trimmed = rawPhone.trim();
  if (!trimmed) return null;
  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return null;
  return `tel:${hasPlus ? '+' : ''}${digits}`;
}

export function sanitizePhoneForWhatsApp(rawPhone: string | undefined): string | null {
  if (!rawPhone || typeof rawPhone !== 'string') return null;
  const trimmed = rawPhone.trim();
  if (!trimmed) return null;
  const hasPlus = trimmed.startsWith('+');
  let digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return null;

  if (!hasPlus) {
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      digits = `91${digits}`;
    } else if (digits.length === 11 && /^0[6-9]/.test(digits)) {
      digits = `91${digits.slice(1)}`;
    }
  }

  return `https://wa.me/${digits}?text=${encodeURIComponent(WHATSAPP_COLLABORATION_GREETING)}`;
}

export function isStudentAvailabilityQualified(
  doc: StudentAvailabilityDoc
): boolean {
  if (!doc || !doc.uid) return false;
  if (doc.emailVerified === false) return false;
  if (doc.isOptedIn !== true) return false;
  if (doc.hasSubmittedTimetable !== true) return false;
  if (typeof doc.totalFreePeriods !== 'number' || doc.totalFreePeriods <= 0) return false;
  if (!Array.isArray(doc.freeSlots) || doc.freeSlots.length === 0) return false;

  const hasName = typeof doc.fullName === 'string' && doc.fullName.trim().length >= 2;
  const hasDept = typeof doc.department === 'string' && doc.department.trim().length >= 2;

  if (doc.profileComplete === false) return false;
  return hasName && hasDept;
}

export function getStudentsAvailableForDayAndSlot(
  students: StudentAvailabilityDoc[],
  dayId: WeekdayId,
  slotId: TimeSlotId
): StudentAvailabilityDoc[] {
  const byUid = new Map<string, StudentAvailabilityDoc>();

  for (const student of students) {
    if (!isStudentAvailabilityQualified(student)) continue;
    if (byUid.has(student.uid)) continue;

    const isFreeInPeriod = student.freeSlots.some(
      (entry) => entry.day === dayId && entry.slotId === slotId
    );
    if (isFreeInPeriod) {
      byUid.set(student.uid, student);
    }
  }

  return Array.from(byUid.values()).sort((a, b) =>
    (a.fullName || '').localeCompare(b.fullName || '')
  );
}

export function getCurrentCampusWeekdayId(date: Date = new Date()): WeekdayId | null {
  return getKolkataTimeContext(date).weekdayId;
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
 * Determines whether a student has a finalized or submitted timetable persisted in Firestore.
 */
export function hasValidStudentTimetable(params: {
  timetableDoc?: StudentTimetableDoc | null;
  lastSubmission?: TimetableSubmissionRecord | null;
}): boolean {
  if (
    params.timetableDoc &&
    (params.timetableDoc.submissionStatus === 'finalized' ||
      params.timetableDoc.submissionStatus === 'submitted' ||
      params.timetableDoc.isLocked === true) &&
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
