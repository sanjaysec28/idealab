import { Timestamp } from 'firebase/firestore';

export type AuthStateStatus =
  | 'loading'
  | 'unauthenticated'
  | 'unverified_email'
  | 'needs_timetable'
  | 'ready';

export interface StudentProfileDoc {
  uid: string;
  fullName: string;
  email: string;
  registrationNumber?: string;
  department?: string;
  academicYear?: string;
  currentAcademicYear?: string;
  currentSemester?: string;
  photoURL?: string;
  timetableCompleted?: boolean;
  timetableStatus?: 'not_submitted' | 'submitted';
  timetableUpdatedAt?: Timestamp;
  profileSetupCompleted?: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  // Legacy optional fields kept read-only so existing Firestore records load without breaking
  membershipStatus?: 'pending' | 'approved' | 'rejected';
  approvedAt?: Timestamp;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface SignupInput {
  fullName: string;
  email: string;
  registrationNumber?: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupDraft {
  fullName: string;
  registrationNumber?: string;
}
