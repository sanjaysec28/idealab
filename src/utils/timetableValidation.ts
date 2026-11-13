import {
  ClassFormValues,
  DaySlotSchedule,
  TIME_SLOTS,
  TimeSlotId,
  TimetableClassEntry,
  TimetableConflict,
  TimetableValidationResult,
  WEEKDAYS,
  WeekdayId,
} from '../types/timetable';

const DAY_LABEL_MAP = Object.fromEntries(WEEKDAYS.map((d) => [d.id, d.label])) as Record<
  WeekdayId,
  string
>;
const SLOT_LABEL_MAP = Object.fromEntries(TIME_SLOTS.map((s) => [s.id, s.label])) as Record<
  TimeSlotId,
  string
>;

const STOP_WORDS = new Set(['of', 'and', 'in', 'for', 'to', 'the', 'with', '&']);

export function generateSubjectAbbreviation(subjectName: string, subjectCode?: string): string {
  const words = subjectName
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w.toLowerCase()));

  if (words.length >= 2) {
    return words
      .slice(0, 4)
      .map((w) => w[0].toUpperCase())
      .join('');
  }

  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 3).toUpperCase();
  }

  const cleanCode = (subjectCode || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return cleanCode.slice(0, 4) || 'SUB';
}

export function normalizeSchedule(
  selectedDays: WeekdayId[],
  scheduleByDay: DaySlotSchedule
): { days: WeekdayId[]; scheduleByDay: DaySlotSchedule } {
  const orderedDays = WEEKDAYS.map((d) => d.id).filter((d) => selectedDays.includes(d));
  const cleanSchedule: DaySlotSchedule = {};

  for (const day of orderedDays) {
    const rawSlots = scheduleByDay[day] ?? [];
    const orderedUniqueSlots = TIME_SLOTS.map((s) => s.id).filter((id) => rawSlots.includes(id));
    if (orderedUniqueSlots.length > 0) {
      cleanSchedule[day] = orderedUniqueSlots;
    }
  }

  const activeDays = orderedDays.filter((d) => (cleanSchedule[d]?.length ?? 0) > 0);
  return { days: activeDays, scheduleByDay: cleanSchedule };
}

export function findScheduleConflicts(
  selectedDays: WeekdayId[],
  scheduleByDay: DaySlotSchedule,
  existingClasses: TimetableClassEntry[],
  editingClassId?: string | null
): TimetableConflict[] {
  const conflicts: TimetableConflict[] = [];

  for (const day of selectedDays) {
    const slots = scheduleByDay[day] ?? [];
    for (const slotId of slots) {
      const match = existingClasses.find((cls) => {
        if (editingClassId && cls.id === editingClassId) {
          return false;
        }
        return Boolean(cls.scheduleByDay[day]?.includes(slotId));
      });
      if (match) {
        conflicts.push({ day, slotId, conflictingClass: match });
      }
    }
  }

  return conflicts;
}

export function validateClassForm(
  values: ClassFormValues,
  existingClasses: TimetableClassEntry[],
  editingClassId?: string | null
): TimetableValidationResult {
  const errors: TimetableValidationResult['errors'] = {};
  const subjectCode = values.subjectCode.trim().toUpperCase();
  const subjectName = values.subjectName.trim();
  const facultyName = values.facultyName.trim();

  if (subjectCode.length < 2) {
    errors.subjectCode = 'Enter a valid subject code (e.g., 19AI303).';
  }
  if (subjectName.length < 2) {
    errors.subjectName = 'Enter the subject name.';
  }
  if (facultyName.length < 2) {
    errors.facultyName = 'Enter the faculty name.';
  }

  if (values.selectedDays.length === 0) {
    errors.days = 'Select at least one class day.';
  }

  const totalSelectedSlots = values.selectedDays.reduce(
    (sum, day) => sum + (values.scheduleByDay[day]?.length ?? 0),
    0
  );

  if (values.selectedDays.length > 0 && totalSelectedSlots === 0) {
    errors.slots = 'Select at least one time slot for your selected day(s).';
  } else if (values.selectedDays.some((day) => (values.scheduleByDay[day]?.length ?? 0) === 0)) {
    const emptyDays = values.selectedDays
      .filter((day) => (values.scheduleByDay[day]?.length ?? 0) === 0)
      .map((day) => DAY_LABEL_MAP[day]);
    errors.slots = `Choose at least one period for ${emptyDays.join(', ')} or deselect it.`;
  }

  // Duplicate subject + faculty check (case-insensitive) excluding the record currently being edited
  if (subjectCode.length >= 2 && facultyName.length >= 2) {
    const duplicate = existingClasses.find(
      (cls) =>
        cls.id !== editingClassId &&
        cls.subjectCode.trim().toUpperCase() === subjectCode &&
        cls.facultyName.trim().toLowerCase() === facultyName.toLowerCase()
    );
    if (duplicate) {
      errors.duplicate = `${subjectCode} with ${duplicate.facultyName} is already in My Classes. Use Edit on that card to update its timings.`;
    }
  }

  const conflicts = findScheduleConflicts(
    values.selectedDays,
    values.scheduleByDay,
    existingClasses,
    editingClassId
  );

  if (conflicts.length > 0) {
    const first = conflicts[0];
    errors.conflict = `Schedule conflict on ${DAY_LABEL_MAP[first.day]} (${SLOT_LABEL_MAP[first.slotId]}): already occupied by ${first.conflictingClass.subjectCode} (${first.conflictingClass.subjectName}).`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    conflicts,
  };
}

export function detectTimetableInternalConflicts(
  classes: TimetableClassEntry[]
): TimetableConflict[] {
  const seen = new Map<string, TimetableClassEntry>();
  const conflicts: TimetableConflict[] = [];

  for (const cls of classes) {
    for (const day of cls.days) {
      const slots = cls.scheduleByDay[day] ?? [];
      for (const slotId of slots) {
        const key = `${day}:${slotId}`;
        const existing = seen.get(key);
        if (existing && existing.id !== cls.id) {
          conflicts.push({ day, slotId, conflictingClass: existing });
        } else {
          seen.set(key, cls);
        }
      }
    }
  }

  return conflicts;
}
