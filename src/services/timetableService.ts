import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { assertValidEmailAddress } from '../firebase/authService';
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
  isStudentAvailabilityQualified,
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
 * Local draft cache ONLY for unsaved UI edits while constructing a timetable.
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

export interface AvailabilityPublicMetadataInput {
  fullName?: string;
  department?: string;
  degree?: string;
  academicYear?: string;
  photoURL?: string;
  avatarPresetId?: string;
  skills?: string[];
  phoneNumber?: string;
  whatsappNumber?: string;
  profileComplete?: boolean;
}

export function sanitizeAvailabilityPublicMetadata(
  input: AvailabilityPublicMetadataInput
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    emailVerified: true,
  };
  const cleanName = input.fullName?.trim().slice(0, 100);
  if (cleanName && cleanName.length >= 2) {
    result.fullName = cleanName;
  }
  const cleanDept = input.department?.trim().slice(0, 80);
  if (cleanDept && cleanDept.length >= 2) {
    result.department = cleanDept;
  }
  const cleanDegree = input.degree?.trim().slice(0, 40);
  if (cleanDegree && cleanDegree.length >= 2) {
    result.degree = cleanDegree;
  }
  const cleanYear = input.academicYear?.trim().slice(0, 24);
  if (cleanYear && cleanYear.length >= 2) {
    result.academicYear = cleanYear;
  }
  if (typeof input.photoURL === 'string') {
    result.photoURL = input.photoURL.trim().slice(0, 1000);
  }
  if (typeof input.avatarPresetId === 'string') {
    result.avatarPresetId = input.avatarPresetId.trim().slice(0, 64);
  }
  if (Array.isArray(input.skills)) {
    result.skills = input.skills
      .map((s) => s.trim().slice(0, 60))
      .filter(Boolean)
      .slice(0, 25);
  }
  if (typeof input.phoneNumber === 'string') {
    result.phoneNumber = input.phoneNumber.trim().slice(0, 32);
  }
  if (typeof input.whatsappNumber === 'string') {
    result.whatsappNumber = input.whatsappNumber.trim().slice(0, 32);
  }
  if (typeof input.profileComplete === 'boolean') {
    result.profileComplete = input.profileComplete;
  }
  return result;
}

export function subscribeToOptedInAvailability(
  _currentUid: string,
  onData: (students: StudentAvailabilityDoc[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = 'students/*/availability';
  const q = query(
    collectionGroup(db, 'availability'),
    where('isOptedIn', '==', true)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const byUid = new Map<string, StudentAvailabilityDoc>();
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as StudentAvailabilityDoc;
        if (isStudentAvailabilityQualified(data) && !byUid.has(data.uid)) {
          byUid.set(data.uid, data);
        }
      });
      const students = Array.from(byUid.values()).sort((a, b) =>
        (a.fullName || '').localeCompare(b.fullName || '')
      );
      onData(students);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export function sanitizeClassesForFirestore(
  classes: TimetableClassEntry[]
): TimetableClassEntry[] {
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

export function extractTimetableAggregates(cleanClasses: TimetableClassEntry[]) {
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

  return {
    selectedWeekdays,
    selectedTimeSlots,
    subjectCodes,
    subjectNames,
    facultyNames,
  };
}

/**
 * Stage A: Acknowledge one-time timetable creation warning without consuming the attempt.
 */
export async function acknowledgeTimetableWarning(uid: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== uid) {
    throw new Error('Your session expired. Please sign in again with Google.');
  }

  if (!currentUser.emailVerified) {
    await currentUser.reload();
  }
  const refreshedUser = auth.currentUser || currentUser;
  if (!refreshedUser.emailVerified) {
    throw new Error('A verified Google account is required to continue.');
  }

  try {
    const tokenResult = await refreshedUser.getIdTokenResult();
    if (!tokenResult.claims.email_verified) {
      await refreshedUser.getIdToken(true);
    }
  } catch {
    // Proceed cleanly; Firestore request will verify auth token state
  }

  const studentRef = doc(db, 'students', uid);
  const auditRef = doc(db, 'timetableAuditLogs', `warn_${uid}`);
  const docPath = `students/${uid}`;

  try {
    await runTransaction(db, async (tx) => {
      const [snap, auditSnap] = await Promise.all([
        tx.get(studentRef),
        tx.get(auditRef),
      ]);

      if (!snap.exists()) {
        throw new Error('Please complete your student profile before continuing.');
      }

      const data = snap.data() as StudentProfileDoc;
      if (data.profileSetupCompleted !== true) {
        throw new Error('Please complete your student profile before continuing.');
      }

      if (data.timetableLocked === true || data.timetableWorkflowState === 'finalized') {
        return; // Timetable already finalized and locked
      }

      if (data.timetableWarningAcceptedAt) {
        return; // Already acknowledged (idempotent)
      }

      tx.update(studentRef, {
        timetableWarningAcceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (!auditSnap.exists()) {
        const cleanStudentEmail = data.email?.trim().slice(0, 160);
        const cleanStudentName = data.fullName?.trim().slice(0, 100);
        const cleanRegNo = data.registrationNumber?.trim().slice(0, 32);
        const cleanActorEmail = refreshedUser.email?.trim().slice(0, 160);

        tx.set(auditRef, {
          studentUid: uid,
          ...(cleanStudentEmail && cleanStudentEmail.length >= 5
            ? { studentEmail: cleanStudentEmail }
            : {}),
          ...(cleanStudentName && cleanStudentName.length >= 1
            ? { studentName: cleanStudentName }
            : {}),
          ...(cleanRegNo && cleanRegNo.length >= 4
            ? { registrationNumber: cleanRegNo }
            : {}),
          action: 'warning_acknowledged',
          actorUid: uid,
          ...(cleanActorEmail && cleanActorEmail.length >= 5
            ? { actorEmail: cleanActorEmail }
            : {}),
          actorRole: 'student',
          timestamp: serverTimestamp(),
        });
      }
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('complete your student profile') ||
        error.message.includes('session expired') ||
        error.message.includes('verified Google account'))
    ) {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Stage B: Create draft timetable (uses 1/1 attempt) or update existing draft while in 'in_review'.
 * Enforces single attempt and rejects once timetable is locked/finalized.
 */
export async function createOrUpdateReviewTimetable(params: {
  classes: TimetableClassEntry[];
  academicMeta?: Partial<TimetableAcademicMeta>;
}): Promise<TimetableSubmissionRecord> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Your session expired. Please sign in again to save your timetable.');
  }

  const uid = currentUser.uid;
  assertValidEmailAddress(currentUser.email);

  if (!Array.isArray(params.classes) || params.classes.length === 0) {
    throw new Error('Add at least one class before saving your timetable draft.');
  }

  const cleanClasses = sanitizeClassesForFirestore(params.classes);
  const conflicts = detectTimetableInternalConflicts(cleanClasses);
  if (conflicts.length > 0) {
    throw new Error('Resolve all schedule conflicts before saving your timetable.');
  }

  const summary = calculateTimetableSummary(cleanClasses);
  if (summary.totalClasses === 0 || summary.totalSubjects === 0) {
    throw new Error('Select at least one weekday and time slot before saving.');
  }

  const studentRef = doc(db, 'students', uid);
  const timetableRef = doc(db, 'students', uid, 'timetable', 'current');
  const auditRef = doc(collection(db, 'timetableAuditLogs'));
  const docPath = `students/${uid}/timetable/current`;

  let savedVersion = 1;
  let resolvedDepartment = DEFAULT_TIMETABLE_ACADEMIC_META.department;
  let resolvedAcademicYear = DEFAULT_TIMETABLE_ACADEMIC_META.academicYear;
  let resolvedSemester = DEFAULT_TIMETABLE_ACADEMIC_META.semester;

  try {
    await runTransaction(db, async (tx) => {
      const [studentSnap, timetableSnap] = await Promise.all([
        tx.get(studentRef),
        tx.get(timetableRef),
      ]);

      if (!studentSnap.exists()) {
        throw new Error('Complete your student profile before creating your timetable.');
      }

      const student = studentSnap.data() as StudentProfileDoc;
      if (student.profileSetupCompleted !== true) {
        throw new Error('Complete your student profile before creating your timetable.');
      }
      if (!student.timetableWarningAcceptedAt) {
        throw new Error('Please acknowledge the one-time timetable notice first.');
      }

      if (student.timetableLocked === true || student.timetableWorkflowState === 'finalized') {
        throw new Error(
          'Your timetable is permanently locked and cannot be edited by students. Contact IDEA LAB Admin if a correction is needed.'
        );
      }

      const existingTimetable = timetableSnap.exists()
        ? (timetableSnap.data() as StudentTimetableDoc)
        : null;

      if (
        existingTimetable &&
        (existingTimetable.isLocked === true ||
          existingTimetable.submissionStatus === 'finalized' ||
          existingTimetable.submissionStatus === 'submitted')
      ) {
        throw new Error(
          'Your timetable has already been finalized and locked. Contact IDEA LAB Admin if a correction is needed.'
        );
      }

      const isFirstCreation = !existingTimetable;
      if (isFirstCreation && (student.timetableAttemptsUsed ?? 0) >= 1) {
        throw new Error(
          'Your one-time timetable creation attempt has already been used.'
        );
      }

      resolvedDepartment = (
        params.academicMeta?.department ||
        student.department ||
        DEFAULT_TIMETABLE_ACADEMIC_META.department
      )
        .trim()
        .slice(0, 80);

      resolvedAcademicYear = (
        params.academicMeta?.academicYear ||
        student.currentAcademicYear ||
        student.academicYear ||
        DEFAULT_TIMETABLE_ACADEMIC_META.academicYear
      )
        .trim()
        .slice(0, 24);

      resolvedSemester = (
        params.academicMeta?.semester ||
        student.currentSemester ||
        DEFAULT_TIMETABLE_ACADEMIC_META.semester
      )
        .trim()
        .slice(0, 24);

      const aggregates = extractTimetableAggregates(cleanClasses);
      savedVersion = existingTimetable ? existingTimetable.version + 1 : 1;

      if (isFirstCreation) {
        tx.set(timetableRef, {
          uid,
          semester: resolvedSemester,
          academicYear: resolvedAcademicYear,
          department: resolvedDepartment,
          classes: cleanClasses,
          ...aggregates,
          totalSubjects: summary.totalSubjects,
          classDays: summary.classDays,
          totalClasses: summary.totalClasses,
          submissionStatus: 'in_review',
          isLocked: false,
          attemptNumber: 1,
          version: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastEditedByUid: uid,
          lastEditedByRole: 'student',
        });

        tx.update(studentRef, {
          department: resolvedDepartment,
          academicYear: resolvedAcademicYear,
          currentAcademicYear: resolvedAcademicYear,
          currentSemester: resolvedSemester,
          timetableWorkflowState: 'in_review',
          timetableAttemptsUsed: 1,
          timetableLocked: false,
          timetableLastModifiedBy: uid,
          timetableUpdatedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        tx.set(auditRef, {
          studentUid: uid,
          studentEmail: student.email,
          studentName: student.fullName,
          ...(student.registrationNumber ? { registrationNumber: student.registrationNumber } : {}),
          action: 'timetable_created',
          actorUid: uid,
          ...(currentUser.email ? { actorEmail: currentUser.email } : {}),
          actorRole: 'student',
          newClasses: cleanClasses,
          previousVersion: 0,
          newVersion: 1,
          timestamp: serverTimestamp(),
        });
      } else {
        tx.update(timetableRef, {
          semester: resolvedSemester,
          academicYear: resolvedAcademicYear,
          department: resolvedDepartment,
          classes: cleanClasses,
          ...aggregates,
          totalSubjects: summary.totalSubjects,
          classDays: summary.classDays,
          totalClasses: summary.totalClasses,
          submissionStatus: 'in_review',
          isLocked: false,
          version: savedVersion,
          updatedAt: serverTimestamp(),
          lastEditedByUid: uid,
          lastEditedByRole: 'student',
        });

        tx.update(studentRef, {
          department: resolvedDepartment,
          academicYear: resolvedAcademicYear,
          currentAcademicYear: resolvedAcademicYear,
          currentSemester: resolvedSemester,
          timetableWorkflowState: 'in_review',
          timetableLastModifiedBy: uid,
          timetableUpdatedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('locked') ||
        error.message.includes('attempt') ||
        error.message.includes('profile') ||
        error.message.includes('notice'))
    ) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }

  clearTimetableDraft(uid);

  return {
    submissionId: `TT-DRAFT-V${savedVersion}-${uid.slice(0, 6).toUpperCase()}`,
    mode: 'firestore',
    version: savedVersion,
    submittedAt: new Date().toISOString(),
    studentUid: uid,
    semester: resolvedSemester,
    academicYear: resolvedAcademicYear,
    department: resolvedDepartment,
    classes: cleanClasses,
    summary,
  };
}

/**
 * Stage C: Permanently finalize and lock student timetable, generate derived availability,
 * and write immutable audit log entry.
 */
export async function finalizeTimetable(params: {
  classes: TimetableClassEntry[];
  academicMeta?: Partial<TimetableAcademicMeta>;
}): Promise<TimetableSubmissionRecord> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Your session expired. Please sign in again to finalize your timetable.');
  }

  const uid = currentUser.uid;
  assertValidEmailAddress(currentUser.email);

  if (!Array.isArray(params.classes) || params.classes.length === 0) {
    throw new Error('Add at least one class before finalizing your timetable.');
  }

  const cleanClasses = sanitizeClassesForFirestore(params.classes);
  const conflicts = detectTimetableInternalConflicts(cleanClasses);
  if (conflicts.length > 0) {
    throw new Error('Resolve all schedule conflicts before finalizing your timetable.');
  }

  const summary = calculateTimetableSummary(cleanClasses);
  if (summary.totalClasses === 0 || summary.totalSubjects === 0) {
    throw new Error('Select at least one weekday and time slot before finalizing.');
  }

  const studentRef = doc(db, 'students', uid);
  const timetableRef = doc(db, 'students', uid, 'timetable', 'current');
  const availabilityRef = doc(db, 'students', uid, 'availability', 'current');
  const auditRef = doc(collection(db, 'timetableAuditLogs'));
  const docPath = `students/${uid}/timetable/current`;

  let finalVersion = 1;
  let resolvedDepartment = DEFAULT_TIMETABLE_ACADEMIC_META.department;
  let resolvedAcademicYear = DEFAULT_TIMETABLE_ACADEMIC_META.academicYear;
  let resolvedSemester = DEFAULT_TIMETABLE_ACADEMIC_META.semester;

  try {
    await runTransaction(db, async (tx) => {
      const [studentSnap, timetableSnap, availSnap] = await Promise.all([
        tx.get(studentRef),
        tx.get(timetableRef),
        tx.get(availabilityRef),
      ]);

      if (!studentSnap.exists()) {
        throw new Error('Complete your student profile before finalizing your timetable.');
      }

      const student = studentSnap.data() as StudentProfileDoc;
      if (student.profileSetupCompleted !== true) {
        throw new Error('Complete your student profile before finalizing your timetable.');
      }
      if (!student.timetableWarningAcceptedAt) {
        throw new Error('Please acknowledge the one-time timetable notice first.');
      }

      if (student.timetableLocked === true || student.timetableWorkflowState === 'finalized') {
        throw new Error('Your timetable is already finalized and locked.');
      }

      const existingTimetable = timetableSnap.exists()
        ? (timetableSnap.data() as StudentTimetableDoc)
        : null;

      if (
        existingTimetable &&
        (existingTimetable.isLocked === true ||
          existingTimetable.submissionStatus === 'finalized' ||
          existingTimetable.submissionStatus === 'submitted')
      ) {
        throw new Error('Your timetable is already finalized and locked.');
      }

      if (!existingTimetable) {
        throw new Error(
          'Please save your timetable draft to Review before confirming permanent finalization.'
        );
      }

      resolvedDepartment = (
        params.academicMeta?.department ||
        student.department ||
        existingTimetable.department ||
        DEFAULT_TIMETABLE_ACADEMIC_META.department
      )
        .trim()
        .slice(0, 80);

      resolvedAcademicYear = (
        params.academicMeta?.academicYear ||
        student.currentAcademicYear ||
        student.academicYear ||
        existingTimetable.academicYear ||
        DEFAULT_TIMETABLE_ACADEMIC_META.academicYear
      )
        .trim()
        .slice(0, 24);

      resolvedSemester = (
        params.academicMeta?.semester ||
        student.currentSemester ||
        existingTimetable.semester ||
        DEFAULT_TIMETABLE_ACADEMIC_META.semester
      )
        .trim()
        .slice(0, 24);

      finalVersion = existingTimetable.version + 1;
      const aggregates = extractTimetableAggregates(cleanClasses);

      const existingAvailability = availSnap.exists()
        ? (availSnap.data() as StudentAvailabilityDoc)
        : null;

      const derivedAvailability = calculateDerivedAvailability({
        uid,
        classes: cleanClasses,
        timetableVersion: finalVersion,
        isOptedIn: existingAvailability?.isOptedIn ?? false,
      });

      const canKeepOptIn =
        Boolean(existingAvailability?.isOptedIn) && derivedAvailability.totalFreePeriods > 0;

      const publicMetadata = sanitizeAvailabilityPublicMetadata({
        fullName: student.fullName || currentUser.displayName || 'IDEA Lab Student',
        department: resolvedDepartment,
        degree: student.degree,
        academicYear: resolvedAcademicYear,
        photoURL: student.photoURL ?? currentUser.photoURL ?? undefined,
        avatarPresetId: student.avatarPresetId,
        skills: student.skills,
        phoneNumber: student.phoneNumber ?? '',
        whatsappNumber: student.whatsappNumber ?? '',
        profileComplete: true,
      });

      tx.update(timetableRef, {
        semester: resolvedSemester,
        academicYear: resolvedAcademicYear,
        department: resolvedDepartment,
        classes: cleanClasses,
        ...aggregates,
        totalSubjects: summary.totalSubjects,
        classDays: summary.classDays,
        totalClasses: summary.totalClasses,
        submissionStatus: 'finalized',
        isLocked: true,
        version: finalVersion,
        submittedAt: serverTimestamp(),
        finalizedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastEditedByUid: uid,
        lastEditedByRole: 'student',
      });

      tx.set(availabilityRef, {
        ...derivedAvailability,
        isOptedIn: canKeepOptIn,
        ...publicMetadata,
        updatedAt: serverTimestamp(),
      });

      tx.update(studentRef, {
        department: resolvedDepartment,
        academicYear: resolvedAcademicYear,
        currentAcademicYear: resolvedAcademicYear,
        currentSemester: resolvedSemester,
        timetableWorkflowState: 'finalized',
        timetableAttemptsUsed: 1,
        timetableLocked: true,
        timetableFinalizedAt: serverTimestamp(),
        timetableLastModifiedBy: uid,
        timetableCompleted: true,
        timetableStatus: 'submitted',
        timetableUpdatedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      tx.set(auditRef, {
        studentUid: uid,
        studentEmail: student.email,
        studentName: student.fullName,
        ...(student.registrationNumber ? { registrationNumber: student.registrationNumber } : {}),
        action: 'timetable_finalized',
        actorUid: uid,
        ...(currentUser.email ? { actorEmail: currentUser.email } : {}),
        actorRole: 'student',
        previousClasses: existingTimetable.classes,
        newClasses: cleanClasses,
        previousVersion: existingTimetable.version,
        newVersion: finalVersion,
        timestamp: serverTimestamp(),
      });
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('locked') ||
        error.message.includes('Review') ||
        error.message.includes('profile') ||
        error.message.includes('notice'))
    ) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }

  clearTimetableDraft(uid);

  return {
    submissionId: `TT-FINAL-V${finalVersion}-${uid.slice(0, 6).toUpperCase()}`,
    mode: 'firestore',
    version: finalVersion,
    submittedAt: new Date().toISOString(),
    studentUid: uid,
    semester: resolvedSemester,
    academicYear: resolvedAcademicYear,
    department: resolvedDepartment,
    classes: cleanClasses,
    summary,
  };
}

export async function updateCollaborationAvailabilityOptIn(
  uid: string,
  isOptedIn: boolean,
  publicProfile?: AvailabilityPublicMetadataInput
): Promise<void> {
  const docPath = `students/${uid}/availability/current`;
  const metadataPatch = publicProfile
    ? sanitizeAvailabilityPublicMetadata(publicProfile)
    : { emailVerified: true };

  try {
    await updateDoc(doc(db, 'students', uid, 'availability', 'current'), {
      isOptedIn: Boolean(isOptedIn),
      ...metadataPatch,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function syncAvailabilityPublicProfile(
  uid: string,
  publicProfile: AvailabilityPublicMetadataInput
): Promise<void> {
  const availabilityRef = doc(db, 'students', uid, 'availability', 'current');
  const docPath = `students/${uid}/availability/current`;
  try {
    const snap = await getDoc(availabilityRef);
    if (!snap.exists()) return;
    const metadataPatch = sanitizeAvailabilityPublicMetadata(publicProfile);
    await updateDoc(availabilityRef, {
      ...metadataPatch,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}
