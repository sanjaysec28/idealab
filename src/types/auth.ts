import { Timestamp } from 'firebase/firestore';

export type MembershipStatusValue = 'pending' | 'approved' | 'rejected';

export type AuthStateStatus =
  | 'loading'
  | 'unauthenticated'
  | 'unverified_email'
  | 'needs_membership_request'
  | 'pending'
  | 'approved'
  | 'rejected';

export interface StudentProfileDoc {
  uid: string;
  fullName: string;
  email: string;
  registrationNumber: string;
  department: string;
  academicYear: string;
  membershipStatus: MembershipStatusValue;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  approvedAt?: Timestamp;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface SignupInput {
  fullName: string;
  email: string;
  registrationNumber: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface MembershipRequestInput {
  fullName: string;
  registrationNumber: string;
  department: string;
  academicYear: string;
}

export interface SignupDraft {
  fullName: string;
  registrationNumber: string;
}
