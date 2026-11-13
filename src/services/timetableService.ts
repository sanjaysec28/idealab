import { cloneDemoTimetableClasses } from '../data/mockTimetable';
import {
  TimetableClassEntry,
  TimetableSubmissionRecord,
  TimetableSummaryMetrics,
} from '../types/timetable';
import { detectTimetableInternalConflicts } from '../utils/timetableValidation';

const STORAGE_KEY_PREFIX = 'idealab_timetable_state_v1_';
const SUBMISSION_KEY_PREFIX = 'idealab_timetable_submission_v1_';

export interface StoredTimetableState {
  classes: TimetableClassEntry[];
  isDemoData: boolean;
  updatedAt: string;
}

export function loadTimetableForStudent(uid: string): StoredTimetableState {
  if (typeof localStorage === 'undefined') {
    return {
      classes: cloneDemoTimetableClasses(),
      isDemoData: true,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${uid}`);
    if (!raw) {
      return {
        classes: cloneDemoTimetableClasses(),
        isDemoData: true,
        updatedAt: new Date().toISOString(),
      };
    }
    const parsed = JSON.parse(raw) as StoredTimetableState;
    return {
      classes: Array.isArray(parsed.classes) ? parsed.classes : [],
      isDemoData: Boolean(parsed.isDemoData),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return {
      classes: cloneDemoTimetableClasses(),
      isDemoData: true,
      updatedAt: new Date().toISOString(),
    };
  }
}

export function saveTimetableForStudent(uid: string, state: StoredTimetableState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${uid}`, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in testing mode
  }
}

export function loadLastTimetableSubmission(uid: string): TimetableSubmissionRecord | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${SUBMISSION_KEY_PREFIX}${uid}`);
    return raw ? (JSON.parse(raw) as TimetableSubmissionRecord) : null;
  } catch {
    return null;
  }
}

/**
 * Frontend testing-mode mock submission service.
 * Keeps Firestore security rules untouched by storing test submissions locally
 * until coordinator-approved Firestore timetable persistence is enabled.
 */
export async function submitTimetableForTesting(params: {
  studentUid: string;
  studentName: string;
  studentEmail: string;
  classes: TimetableClassEntry[];
  summary: TimetableSummaryMetrics;
}): Promise<TimetableSubmissionRecord> {
  if (params.classes.length === 0) {
    throw new Error('Add at least one class before submitting your timetable.');
  }

  const conflicts = detectTimetableInternalConflicts(params.classes);
  if (conflicts.length > 0) {
    throw new Error('Resolve all schedule conflicts before submitting your timetable.');
  }

  await new Promise((resolve) => setTimeout(resolve, 350));

  const record: TimetableSubmissionRecord = {
    submissionId: `TEST-TT-${Date.now().toString(36).toUpperCase()}`,
    mode: 'testing-mock',
    submittedAt: new Date().toISOString(),
    studentUid: params.studentUid,
    studentName: params.studentName,
    studentEmail: params.studentEmail,
    classes: params.classes,
    summary: params.summary,
  };

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`${SUBMISSION_KEY_PREFIX}${params.studentUid}`, JSON.stringify(record));
    } catch {
      // Ignore storage quota errors
    }
  }

  return record;
}

export function clearTimetableSubmissionForStudent(uid: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(`${SUBMISSION_KEY_PREFIX}${uid}`);
  } catch {
    // Ignore
  }
}
