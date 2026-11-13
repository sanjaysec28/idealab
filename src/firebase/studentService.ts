import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHandling';
import { StudentProfileDoc } from '../types/auth';

const STUDENTS_COLLECTION = 'students';

export async function getStudentProfile(uid: string): Promise<StudentProfileDoc | null> {
  const docPath = `${STUDENTS_COLLECTION}/${uid}`;
  try {
    const snapshot = await getDoc(doc(db, STUDENTS_COLLECTION, uid));
    if (!snapshot.exists()) {
      return null;
    }
    return snapshot.data() as StudentProfileDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

export function subscribeToStudentProfile(
  uid: string,
  onData: (profile: StudentProfileDoc | null) => void,
  onError?: (error: Error) => void
): () => void {
  const docPath = `${STUDENTS_COLLECTION}/${uid}`;
  return onSnapshot(
    doc(db, STUDENTS_COLLECTION, uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      onData(snapshot.data() as StudentProfileDoc);
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

export async function updateStudentProfileDetails(
  uid: string,
  updates: {
    fullName: string;
    department: string;
    academicYear: string;
    currentSemester?: string;
  }
): Promise<void> {
  const docPath = `${STUDENTS_COLLECTION}/${uid}`;
  const fullName = updates.fullName.trim().slice(0, 100);
  const department = updates.department.trim().slice(0, 80);
  const academicYear = updates.academicYear.trim().slice(0, 24);
  const currentSemester = updates.currentSemester?.trim().slice(0, 24);

  if (fullName.length < 2) {
    throw new Error('Full name must be at least 2 characters.');
  }

  try {
    await updateDoc(doc(db, STUDENTS_COLLECTION, uid), {
      fullName,
      department,
      academicYear,
      currentAcademicYear: academicYear,
      ...(currentSemester ? { currentSemester } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}
