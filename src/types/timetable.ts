import { Timestamp } from 'firebase/firestore';

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
  startTime: string;
  endTime: string;
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

export interface TimetableAcademicMeta {
  department: string;
  academicYear: string;
  semester: string;
}

export interface TimetableFreeSlotDetail {
  day: WeekdayId;
  slotId: TimeSlotId;
  startTime: string;
  endTime: string;
  label: string;
}

export interface StudentTimetableDoc {
  uid: string;
  semester: string;
  academicYear: string;
  department: string;
  classes: TimetableClassEntry[];
  selectedWeekdays: WeekdayId[];
  selectedTimeSlots: TimeSlotId[];
  subjectCodes: string[];
  subjectNames: string[];
  facultyNames: string[];
  totalSubjects: number;
  classDays: number;
  totalClasses: number;
  submissionStatus: 'submitted';
  version: number;
  submittedAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface StudentAvailabilityDoc {
  uid: string;
  freeSlots: TimetableFreeSlotDetail[];
  totalFreePeriods: number;
  totalOccupiedPeriods: number;
  utilizationPercentage: number;
  isOptedIn: boolean;
  hasSubmittedTimetable: boolean;
  timetableVersion: number;
  fullName?: string;
  department?: string;
  academicYear?: string;
  photoURL?: string;
  avatarPresetId?: string;
  skills?: string[];
  emailVerified?: boolean;
  updatedAt?: Timestamp;
}

export interface TimetableSubmissionRecord {
  submissionId: string;
  mode: 'firestore';
  version: number;
  submittedAt: string;
  studentUid: string;
  semester: string;
  academicYear: string;
  department: string;
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
  { id: 'slot-1', label: '8:00 AM – 9:30 AM', shortLabel: '8:00 AM', startTime: '8:00 AM', endTime: '9:30 AM' },
  { id: 'slot-2', label: '9:45 AM – 11:15 AM', shortLabel: '9:45 AM', startTime: '9:45 AM', endTime: '11:15 AM' },
  { id: 'slot-3', label: '1:15 PM – 2:45 PM', shortLabel: '1:15 PM', startTime: '1:15 PM', endTime: '2:45 PM' },
  { id: 'slot-4', label: '3:00 PM – 4:30 PM', shortLabel: '3:00 PM', startTime: '3:00 PM', endTime: '4:30 PM' },
];

export const TOTAL_WEEKLY_PERIODS = WEEKDAYS.length * TIME_SLOTS.length; // 6 * 4 = 24
