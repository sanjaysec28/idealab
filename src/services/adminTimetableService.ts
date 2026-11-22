import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandling';
import { StudentProfileDoc } from '../types/auth';
import {
  StudentAvailabilityDoc,
  StudentTimetableDoc,
  TimetableAcademicMeta,
  TimetableAuditLogDoc,
  TimetableClassEntry,
} from '../types/timetable';
import { normalizeRegistrationNumber } from '../utils/academicConstants';
import {
  calculateDerivedAvailability,
  calculateTimetableSummary,
} from '../utils/timetableCalculations';
import { detectTimetableInternalConflicts } from '../utils/timetableValidation';
import {
  DEFAULT_TIMETABLE_ACADEMIC_META,
  extractTimetableAggregates,
  sanitizeAvailabilityPublicMetadata,
  sanitizeClassesForFirestore,
} from './timetableService';

export interface AdminLoadedStudentRecord {
  profile: StudentProfileDoc;
  timetable: StudentTimetableDoc | null;
  availability: StudentAvailabilityDoc | null;
  auditLogs: TimetableAuditLogDoc[];
}

export async function adminFetchStudentAuditLogs(
  studentUid: string
): Promise<TimetableAuditLogDoc[]> {
  const path = 'timetableAuditLogs';
  try {
    const q = query(
      collection(db, 'timetableAuditLogs'),
      where('studentUid', '==', studentUid),
      limit(40)
    );
    const snap = await getDocs(q);
    const logs: TimetableAuditLogDoc[] = [];
    snap.forEach((docSnap) => {
      logs.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<TimetableAuditLogDoc, 'id'>),
      });
    });

    logs.sort((a, b) => {
      const aMs = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
      const bMs = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
      return bMs - aMs;
    });
    return logs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function adminSearchStudents(
  searchQuery: string
): Promise<StudentProfileDoc[]> {
  const trimmed = searchQuery.trim();
  if (!trimmed) return [];

  const resultsByUid = new Map<string, StudentProfileDoc>();
  const normalizedReg = normalizeRegistrationNumber(trimmed);

  // 1. Direct lookup via /registrationNumbers/{regNo} -> /students/{uid}
  if (normalizedReg.length >= 4 && /^[A-Z0-9-]+$/.test(normalizedReg)) {
    try {
      const regSnap = await getDoc(doc(db, 'registrationNumbers', normalizedReg));
      if (regSnap.exists()) {
        const regUid = (regSnap.data() as { uid?: string }).uid;
        if (regUid) {
          const studentSnap = await getDoc(doc(db, 'students', regUid));
          if (studentSnap.exists()) {
            resultsByUid.set(regUid, studentSnap.data() as StudentProfileDoc);
          }
        }
      }
    } catch {
      // Continue to query-based fallback
    }
  }

  // 2. Exact email lookup
  if (trimmed.includes('@')) {
    try {
      const emailQ = query(
        collection(db, 'students'),
        where('email', '==', trimmed.toLowerCase()),
        limit(10)
      );
      const emailSnap = await getDocs(emailQ);
      emailSnap.forEach((d) => {
        const profile = d.data() as StudentProfileDoc;
        resultsByUid.set(profile.uid, profile);
      });
    } catch {
      // Ignore if list claim isn't present on custom /admins/{uid} user
    }
  }

  // 3. Name / partial match via recent student batch (when list claim is authorized)
  if (resultsByUid.size === 0) {
    try {
      const listSnap = await getDocs(query(collection(db, 'students'), limit(80)));
      const needle = trimmed.toLowerCase();
      listSnap.forEach((d) => {
        const profile = d.data() as StudentProfileDoc;
        const matchesName = profile.fullName?.toLowerCase().includes(needle);
        const matchesEmail = profile.email?.toLowerCase().includes(needle);
        const matchesReg = profile.registrationNumber?.toLowerCase().includes(needle);
        if (matchesName || matchesEmail || matchesReg) {
          resultsByUid.set(profile.uid, profile);
        }
      });
    } catch {
      // Ignore if admin uses /admins/{uid} without list claim; exact regNo lookup still succeeded above
    }
  }

  return Array.from(resultsByUid.values()).sort((a, b) =>
    (a.fullName || '').localeCompare(b.fullName || '')
  );
}

export async function adminLoadStudentRecord(
  studentUid: string
): Promise<AdminLoadedStudentRecord> {
  const path = `students/${studentUid}`;
  try {
    const [studentSnap, timetableSnap, availSnap] = await Promise.all([
      getDoc(doc(db, 'students', studentUid)),
      getDoc(doc(db, 'students', studentUid, 'timetable', 'current')),
      getDoc(doc(db, 'students', studentUid, 'availability', 'current')),
    ]);

    if (!studentSnap.exists()) {
      throw new Error('Student profile document was not found.');
    }

    let auditLogs: TimetableAuditLogDoc[] = [];
    try {
      auditLogs = await adminFetchStudentAuditLogs(studentUid);
    } catch {
      auditLogs = [];
    }

    return {
      profile: studentSnap.data() as StudentProfileDoc,
      timetable: timetableSnap.exists() ? (timetableSnap.data() as StudentTimetableDoc) : null,
      availability: availSnap.exists() ? (availSnap.data() as StudentAvailabilityDoc) : null,
      auditLogs,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function adminUpdateStudentTimetable(params: {
  studentUid: string;
  classes: TimetableClassEntry[];
  academicMeta?: Partial<TimetableAcademicMeta>;
  reason: string;
}): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Admin session expired. Please sign in again.');
  }

  const cleanReason = params.reason.trim().slice(0, 500);
  if (cleanReason.length < 5) {
    throw new Error(
      'Please enter a clear correction reason (minimum 5 characters) for the audit log.'
    );
  }

  if (!Array.isArray(params.classes) || params.classes.length === 0) {
    throw new Error('Student timetable must include at least one class.');
  }

  const cleanClasses = sanitizeClassesForFirestore(params.classes);
  const conflicts = detectTimetableInternalConflicts(cleanClasses);
  if (conflicts.length > 0) {
    throw new Error('Resolve all schedule conflicts before saving admin corrections.');
  }

  const summary = calculateTimetableSummary(cleanClasses);
  if (summary.totalClasses === 0 || summary.totalSubjects === 0) {
    throw new Error('At least one scheduled class period is required.');
  }

  const studentRef = doc(db, 'students', params.studentUid);
  const timetableRef = doc(db, 'students', params.studentUid, 'timetable', 'current');
  const availabilityRef = doc(db, 'students', params.studentUid, 'availability', 'current');
  const auditRef = doc(collection(db, 'timetableAuditLogs'));
  const docPath = `students/${params.studentUid}/timetable/current`;

  try {
    await runTransaction(db, async (tx) => {
      const [studentSnap, timetableSnap, availSnap] = await Promise.all([
        tx.get(studentRef),
        tx.get(timetableRef),
        tx.get(availabilityRef),
      ]);

      if (!studentSnap.exists()) {
        throw new Error('Target student profile does not exist.');
      }

      const student = studentSnap.data() as StudentProfileDoc;
      const existingTimetable = timetableSnap.exists()
        ? (timetableSnap.data() as StudentTimetableDoc)
        : null;
      const existingAvailability = availSnap.exists()
        ? (availSnap.data() as StudentAvailabilityDoc)
        : null;

      const resolvedDepartment = (
        params.academicMeta?.department ||
        existingTimetable?.department ||
        student.department ||
        DEFAULT_TIMETABLE_ACADEMIC_META.department
      )
        .trim()
        .slice(0, 80);

      const resolvedAcademicYear = (
        params.academicMeta?.academicYear ||
        existingTimetable?.academicYear ||
        student.currentAcademicYear ||
        student.academicYear ||
        DEFAULT_TIMETABLE_ACADEMIC_META.academicYear
      )
        .trim()
        .slice(0, 24);

      const resolvedSemester = (
        params.academicMeta?.semester ||
        existingTimetable?.semester ||
        student.currentSemester ||
        DEFAULT_TIMETABLE_ACADEMIC_META.semester
      )
        .trim()
        .slice(0, 24);

      const previousVersion = existingTimetable?.version ?? 0;
      const nextVersion = previousVersion + 1;
      const aggregates = extractTimetableAggregates(cleanClasses);

      if (existingTimetable) {
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
          attemptNumber: 1,
          version: nextVersion,
          updatedAt: serverTimestamp(),
          lastEditedByUid: currentUser.uid,
          lastEditedByRole: 'admin',
        });
      } else {
        tx.set(timetableRef, {
          uid: params.studentUid,
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
          attemptNumber: 1,
          version: nextVersion,
          createdAt: serverTimestamp(),
          submittedAt: serverTimestamp(),
          finalizedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastEditedByUid: currentUser.uid,
          lastEditedByRole: 'admin',
        });
      }

      const derivedAvailability = calculateDerivedAvailability({
        uid: params.studentUid,
        classes: cleanClasses,
        timetableVersion: nextVersion,
        isOptedIn: existingAvailability?.isOptedIn ?? false,
      });

      const canKeepOptIn =
        Boolean(existingAvailability?.isOptedIn) && derivedAvailability.totalFreePeriods > 0;

      const publicMetadata = sanitizeAvailabilityPublicMetadata({
        fullName: student.fullName || 'IDEA Lab Student',
        department: resolvedDepartment,
        degree: student.degree,
        academicYear: resolvedAcademicYear,
        photoURL: student.photoURL,
        avatarPresetId: student.avatarPresetId,
        skills: student.skills,
        phoneNumber: student.phoneNumber ?? '',
        whatsappNumber: student.whatsappNumber ?? '',
        profileComplete: true,
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
        timetableCompleted: true,
        timetableStatus: 'submitted',
        timetableLastModifiedBy: currentUser.uid,
        timetableUpdatedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(!student.timetableFinalizedAt ? { timetableFinalizedAt: serverTimestamp() } : {}),
      });

      tx.set(auditRef, {
        studentUid: params.studentUid,
        studentEmail: student.email,
        studentName: student.fullName,
        ...(student.registrationNumber ? { registrationNumber: student.registrationNumber } : {}),
        action: 'admin_correction',
        actorUid: currentUser.uid,
        ...(currentUser.email ? { actorEmail: currentUser.email } : {}),
        actorRole: 'admin',
        reason: cleanReason,
        previousClasses: existingTimetable?.classes ?? [],
        newClasses: cleanClasses,
        previousVersion,
        newVersion: nextVersion,
        timestamp: serverTimestamp(),
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('reason')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}
