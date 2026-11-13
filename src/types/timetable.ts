export type WeekdayId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export type TimeSlotId = 'slot-1' | 'slot-2' | 'slot-3' | 'slot-4';

export interface WeekdayOption {
  id: WeekdayId;
  shortLabel: string;
  label: string;
}

export interface TimeSlotOption {
  id: TimeSlotId;
  label: string;
  shortLabel: string;
}

/**
 * Mapping of selected weekday -> array of selected time slot IDs for that day.
 */
export type DaySlotSchedule = Partial<Record<WeekdayId, TimeSlotId[]>>;

export interface TimetableClassEntry {
  id: string;
  subjectCode: string;
  subjectName: string;
  subjectAbbreviation: string;
  facultyName: string;
  days: WeekdayId[];
  scheduleByDay: DaySlotSchedule;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassFormValues {
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  selectedDays: WeekdayId[];
  scheduleByDay: DaySlotSchedule;
}

export interface TimetableConflict {
  day: WeekdayId;
  slotId: TimeSlotId;
  conflictingClass: TimetableClassEntry;
}

export interface TimetableValidationResult {
  valid: boolean;
  errors: {
    subjectCode?: string;
    subjectName?: string;
    facultyName?: string;
    days?: string;
    slots?: string;
    conflict?: string;
    duplicate?: string;
  };
  conflicts: TimetableConflict[];
}

export interface TimetableSummaryMetrics {
  totalSubjects: number;
  classDays: number;
  totalClasses: number;
  totalPossiblePeriods: number;
  freePeriods: number;
  utilizationPercent: number;
}

export interface TimetableSubmissionRecord {
  submissionId: string;
  mode: 'testing-mock';
  submittedAt: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  classes: TimetableClassEntry[];
  summary: TimetableSummaryMetrics;
}

export const WEEKDAYS: WeekdayOption[] = [
  { id: 'mon', shortLabel: 'Mon', label: 'Monday' },
  { id: 'tue', shortLabel: 'Tue', label: 'Tuesday' },
  { id: 'wed', shortLabel: 'Wed', label: 'Wednesday' },
  { id: 'thu', shortLabel: 'Thu', label: 'Thursday' },
  { id: 'fri', shortLabel: 'Fri', label: 'Friday' },
  { id: 'sat', shortLabel: 'Sat', label: 'Saturday' },
];

export const TIME_SLOTS: TimeSlotOption[] = [
  { id: 'slot-1', label: '8:00 AM – 9:30 AM', shortLabel: '8:00 AM' },
  { id: 'slot-2', label: '9:45 AM – 11:15 AM', shortLabel: '9:45 AM' },
  { id: 'slot-3', label: '1:15 PM – 2:45 PM', shortLabel: '1:15 PM' },
  { id: 'slot-4', label: '3:00 PM – 4:30 PM', shortLabel: '3:00 PM' },
];

export const TOTAL_WEEKLY_PERIODS = WEEKDAYS.length * TIME_SLOTS.length; // 6 * 4 = 24
