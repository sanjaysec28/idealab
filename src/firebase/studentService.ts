import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './config';
import { handleFirestoreError, OperationType } from './errorHandling';
import { clearSignupDraft } from './authService';
import { MembershipRequestInput, StudentProfileDoc } from '../types/auth';

const STUDENTS_COLLECTION = 'students';
const REG_NUMBER_PATTERN = /^[A-Za-z0-9-]+$/;

export function validateMembershipInput(input: MembershipRequestInput): MembershipRequestInput {
  const fullName = input.fullName.trim().slice(0, 100);
  const registrationNumber = input.registrationNumber.trim().toUpperCase().slice(0, 32);
  const department = input.department.trim().slice(0, 80);
  const academicYear = input.academicYear.trim().slice(0, 24);

  if (fullName.length < 2) {
    throw new Error('Full name must be at least 2 characters.');
  }
  if (registrationNumber.length < 4 || !REG_NUMBER_PATTERN.test(registrationNumber)) {
    throw new Error(
      'Registration number must be 4–32 characters using only letters, numbers, and hyphens.'
    );
  }
  if (department.length < 2) {
    throw new Error('Please select your academic department.');
  }
  if (academicYear.length < 2) {
    throw new Error('Please select your academic year.');
  }

  return { fullName, registrationNumber, department, academicYear };
}

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

export async function submitStudentMembershipRequest(
  rawInput: MembershipRequestInput
): Promise<StudentProfileDoc> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Please sign in before submitting a membership request.');
  }

  await currentUser.reload();
  const refreshedUser = auth.currentUser || currentUser;

  if (!refreshedUser.emailVerified) {
    throw new Error('Please verify your college email address before submitting your membership request.');
  }

  if (!refreshedUser.email) {
    throw new Error('Verified email address is missing on your account.');
  }

  const sanitized = validateMembershipInput(rawInput);
  const docPath = `${STUDENTS_COLLECTION}/${refreshedUser.uid}`;
  const docRef = doc(db, STUDENTS_COLLECTION, refreshedUser.uid);

  const existing = await getStudentProfile(refreshedUser.uid);
  if (existing) {
    clearSignupDraft(refreshedUser.uid);
    return existing;
  }

  try {
    await setDoc(docRef, {
      uid: refreshedUser.uid,
      fullName: sanitized.fullName,
      email: refreshedUser.email,
      registrationNumber: sanitized.registrationNumber,
      department: sanitized.department,
      academicYear: sanitized.academicYear,
      membershipStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }

  clearSignupDraft(refreshedUser.uid);
  const created = await getStudentProfile(refreshedUser.uid);
  if (!created) {
    throw new Error('Membership request was submitted, but profile could not be loaded.');
  }
  return created;
}

export async function updateApprovedStudentProfile(
  uid: string,
  updates: { fullName: string; department: string; academicYear: string }
): Promise<void> {
  const docPath = `${STUDENTS_COLLECTION}/${uid}`;
  const fullName = updates.fullName.trim().slice(0, 100);
  const department = updates.department.trim().slice(0, 80);
  const academicYear = updates.academicYear.trim().slice(0, 24);

  if (fullName.length < 2) {
    throw new Error('Full name must be at least 2 characters.');
  }

  try {
    await updateDoc(doc(db, STUDENTS_COLLECTION, uid), {
      fullName,
      department,
      academicYear,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}
