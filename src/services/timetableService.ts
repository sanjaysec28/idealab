import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { assertValidEmailAddress, clearSignupDraft } from '../firebase/authService';
import { handleFirestoreError, OperationType } from '../firebase/errorHandling';
import { StudentProfileDoc } from '../types/auth';
import {
  StudentAvailabilityDoc,
  StudentTimetableDoc,
  TIME_SLOTS,
  TimeSlotId,
  TimetableAcademicMeta,
  TimetableClassEntry,
  TimetableSubmissionRecord,
  WEEKDAYS,
  WeekdayId,
} from '../types/timetable';
import {
  calculateDerivedAvailability,
  calculateTimetableSummary,
} from '../utils/timetableCalculations';
import { detectTimetableInternalConflicts } from '../utils/timetableValidation';

const DRAFT_STORAGE_KEY_PREFIX = 'idealab_timetable_draft_v2_';

export const DEFAULT_TIMETABLE_ACADEMIC_META: TimetableAcademicMeta = {
  department: 'AI & Data Science',
  academicYear: '3rd Year',
  semester: 'Semester 5',
};

export interface LocalTimetableDraft {
  classes: TimetableClassEntry[];
  updatedAt: string;
}

/**
 * Local draft cache ONLY for unsaved edits in progress.
 * Never returns sample/demo classes as a real student's timetable.
 */
export function loadTimetableDraft(uid: string): LocalTimetableDraft {
  if (typeof localStorage === 'undefined' || !uid) {
    return { classes: [], updatedAt: new Date().toISOString() };
  }
  try {
    const raw = localStorage.getItem(`${DRAFT_STORAGE_KEY_PREFIX}${uid}`);
    if (!raw) {
      return { classes: [], updatedAt: new Date().toISOString() };
    }
    const parsed = JSON.parse(raw) as Partial<LocalTimetableDraft>;
    return {
      classes: Array.isArray(parsed.classes) ? parsed.classes : [],
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return { classes: [], updatedAt: new Date().toISOString() };
  }
}

export function saveTimetableDraft(uid: string, classes: TimetableClassEntry[]): void {
  if (typeof localStorage === 'undefined' || !uid) return;
  try {
    const payload: LocalTimetableDraft = {
      classes,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${DRAFT_STORAGE_KEY_PREFIX}${uid}`, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearTimetableDraft(uid: string): void {
  if (typeof localStorage === 'undefined' || !uid) return;
  try {
    localStorage.removeItem(`${DRAFT_STORAGE_KEY_PREFIX}${uid}`);
  } catch {
    // Ignore
  }
}

export async function getStudentTimetable(uid: string): Promise<StudentTimetableDoc | null> {
  const docPath = `students/${uid}/timetable/current`;
  try {
    const snapshot = await getDoc(doc(db, 'students', uid, 'timetable', 'current'));
    if (!snapshot.exists()) return null;
    return snapshot.data() as StudentTimetableDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

export function subscribeToStudentTimetable(
  uid: string,
  onData: (timetable: StudentTimetableDoc | null) => void,
  onError?: (error: Error) => void
): () => void {
  const docPath = `students/${uid}/timetable/current`;
  return onSnapshot(
    doc(db, 'students', uid, 'timetable', 'current'),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      onData(snapshot.data() as StudentTimetableDoc);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, docPath);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export async function getStudentAvailability(uid: string): Promise<StudentAvailabilityDoc | null> {
  const docPath = `students/${uid}/availability/current`;
  try {
    const snapshot = await getDoc(doc(db, 'students', uid, 'availability', 'current'));
    if (!snapshot.exists()) return null;
    return snapshot.data() as StudentAvailabilityDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

export function subscribeToStudentAvailability(
  uid: string,
  onData: (availability: StudentAvailabilityDoc | null) => void,
  onError?: (error: Error) => void
): () => void {
  const docPath = `students/${uid}/availability/current`;
  return onSnapshot(
    doc(db, 'students', uid, 'availability', 'current'),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      onData(snapshot.data() as StudentAvailabilityDoc);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, docPath);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

function sanitizeClassesForFirestore(classes: TimetableClassEntry[]): TimetableClassEntry[] {
  const validDaySet = new Set<WeekdayId>(WEEKDAYS.map((d) => d.id));
  const validSlotSet = new Set<TimeSlotId>(TIME_SLOTS.map((s) => s.id));

  return classes.slice(0, 24).map((cls) => {
    const cleanDays = WEEKDAYS.map((d) => d.id).filter(
      (day) => cls.days.includes(day) && (cls.scheduleByDay[day]?.length ?? 0) > 0
    );
    const cleanSchedule: Partial<Record<WeekdayId, TimeSlotId[]>> = {};
    for (const day of cleanDays) {
      if (!validDaySet.has(day)) continue;
      const slots = (cls.scheduleByDay[day] ?? []).filter((slot) => validSlotSet.has(slot));
      if (slots.length > 0) {
        cleanSchedule[day] = TIME_SLOTS.map((s) => s.id).filter((id) => slots.includes(id));
      }
    }

    return {
      id: String(cls.id).slice(0, 80),
      subjectCode: cls.subjectCode.trim().toUpperCase().slice(0, 24),
      subjectName: cls.subjectName.trim().slice(0, 120),
      subjectAbbreviation: cls.subjectAbbreviation.trim().toUpperCase().slice(0, 12),
      facultyName: cls.facultyName.trim().slice(0, 100),
      days: cleanDays,
      scheduleByDay: cleanSchedule,
      createdAt: cls.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

export async function submitFinalTimetableToFirestore(params: {
  classes: TimetableClassEntry[];
  academicMeta?: Partial<TimetableAcademicMeta>;
  studentFullName?: string;
  existingProfile?: StudentProfileDoc | null;
  existingTimetable?: StudentTimetableDoc | null;
  existingAvailability?: StudentAvailabilityDoc | null;
}): Promise<TimetableSubmissionRecord> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Your session expired. Please sign in again to save your timetable.');
  }

  await currentUser.reload();
  const refreshedUser = auth.currentUser || currentUser;

  if (!refreshedUser.emailVerified) {
    throw new Error('Please verify your email address before submitting your timetable.');
  }

  const tokenResult = await refreshedUser.getIdTokenResult();
  if (!tokenResult.claims.email_verified) {
    await refreshedUser.getIdToken(true);
  }

  const verifiedEmail = assertValidEmailAddress(refreshedUser.email);
  const uid = refreshedUser.uid;

  if (!Array.isArray(params.classes) || params.classes.length === 0) {
    throw new Error('Add at least one class before submitting your timetable.');
  }

  const cleanClasses = sanitizeClassesForFirestore(params.classes);
  const conflicts = detectTimetableInternalConflicts(cleanClasses);
  if (conflicts.length > 0) {
    throw new Error('Resolve all schedule conflicts before submitting your timetable.');
  }

  const summary = calculateTimetableSummary(cleanClasses);
  if (summary.totalClasses === 0 || summary.totalSubjects === 0) {
    throw new Error('Select at least one weekday and time slot before submitting.');
  }

  const existingProfile =
    params.existingProfile !== undefined
      ? params.existingProfile
      : await getDoc(doc(db, 'students', uid)).then((snap) =>
          snap.exists() ? (snap.data() as StudentProfileDoc) : null
        );

  const existingTimetable =
    params.existingTimetable !== undefined
      ? params.existingTimetable
      : await getStudentTimetable(uid);

  const existingAvailability =
    params.existingAvailability !== undefined
      ? params.existingAvailability
      : await getStudentAvailability(uid);

  const nextVersion = (existingTimetable?.version ?? 0) + 1;

  const department = (
    params.academicMeta?.department ||
    existingProfile?.department ||
    DEFAULT_TIMETABLE_ACADEMIC_META.department
  )
    .trim()
    .slice(0, 80);

  const academicYear = (
    params.academicMeta?.academicYear ||
    existingProfile?.currentAcademicYear ||
    existingProfile?.academicYear ||
    DEFAULT_TIMETABLE_ACADEMIC_META.academicYear
  )
    .trim()
    .slice(0, 24);

  const semester = (
    params.academicMeta?.semester ||
    existingProfile?.currentSemester ||
    DEFAULT_TIMETABLE_ACADEMIC_META.semester
  )
    .trim()
    .slice(0, 24);

  const resolvedFullName = (
    existingProfile?.fullName ||
    params.studentFullName ||
    refreshedUser.displayName ||
    verifiedEmail.split('@')[0] ||
    'IDEA Lab Student'
  )
    .trim()
    .slice(0, 100);

  const safeFullName = resolvedFullName.length >= 2 ? resolvedFullName : 'IDEA Lab Student';

  const selectedWeekdays = WEEKDAYS.map((d) => d.id).filter((day) =>
    cleanClasses.some((cls) => (cls.scheduleByDay[day]?.length ?? 0) > 0)
  );
  const selectedTimeSlots = TIME_SLOTS.map((s) => s.id).filter((slotId) =>
    cleanClasses.some((cls) =>
      Object.values(cls.scheduleByDay).some((slots) => slots?.includes(slotId))
    )
  );
  const subjectCodes = Array.from(new Set(cleanClasses.map((c) => c.subjectCode))).slice(0, 24);
  const subjectNames = Array.from(new Set(cleanClasses.map((c) => c.subjectName))).slice(0, 24);
  const facultyNames = Array.from(new Set(cleanClasses.map((c) => c.facultyName))).slice(0, 24);

  const derivedAvailability = calculateDerivedAvailability({
    uid,
    classes: cleanClasses,
    timetableVersion: nextVersion,
    isOptedIn: existingAvailability?.isOptedIn ?? false,
  });

  const batch = writeBatch(db);
  const timetableRef = doc(db, 'students', uid, 'timetable', 'current');
  const availabilityRef = doc(db, 'students', uid, 'availability', 'current');
  const studentRef = doc(db, 'students', uid);

  batch.set(timetableRef, {
    uid,
    semester,
    academicYear,
    department,
    classes: cleanClasses,
    selectedWeekdays,
    selectedTimeSlots,
    subjectCodes,
    subjectNames,
    facultyNames,
    totalSubjects: summary.totalSubjects,
    classDays: summary.classDays,
    totalClasses: summary.totalClasses,
    submissionStatus: 'submitted',
    version: nextVersion,
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(availabilityRef, {
    ...derivedAvailability,
    updatedAt: serverTimestamp(),
  });

  const cleanPhotoUrl =
    refreshedUser.photoURL && refreshedUser.photoURL.trim().length > 0
      ? refreshedUser.photoURL.trim().slice(0, 500)
      : undefined;

  if (existingProfile) {
    batch.update(studentRef, {
      fullName: safeFullName,
      department,
      academicYear,
      currentAcademicYear: academicYear,
      currentSemester: semester,
      ...(cleanPhotoUrl ? { photoURL: cleanPhotoUrl } : {}),
      timetableCompleted: true,
      timetableStatus: 'submitted',
      timetableUpdatedAt: serverTimestamp(),
      profileSetupCompleted: true,
      updatedAt: serverTimestamp(),
    });
  } else {
    batch.set(studentRef, {
      uid,
      fullName: safeFullName,
      email: verifiedEmail,
      department,
      academicYear,
      currentAcademicYear: academicYear,
      currentSemester: semester,
      ...(cleanPhotoUrl ? { photoURL: cleanPhotoUrl } : {}),
      timetableCompleted: true,
      timetableStatus: 'submitted',
      timetableUpdatedAt: serverTimestamp(),
      profileSetupCompleted: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(
      error,
      existingProfile ? OperationType.UPDATE : OperationType.CREATE,
      `students/${uid}/timetable/current`
    );
  }

  clearTimetableDraft(uid);
  clearSignupDraft(uid);

  return {
    submissionId: `TT-V${nextVersion}-${uid.slice(0, 6).toUpperCase()}`,
    mode: 'firestore',
    version: nextVersion,
    submittedAt: new Date().toISOString(),
    studentUid: uid,
    semester,
    academicYear,
    department,
    classes: cleanClasses,
    summary,
  };
}

export async function updateCollaborationAvailabilityOptIn(
  uid: string,
  isOptedIn: boolean
): Promise<void> {
  const docPath = `students/${uid}/availability/current`;
  try {
    await updateDoc(doc(db, 'students', uid, 'availability', 'current'), {
      isOptedIn: Boolean(isOptedIn),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}
