export enum MembershipStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export type AuthStateStatus =
  | 'loading'
  | 'unauthenticated'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'suspended';

export interface AuthenticatedUser {
  uid: string;
  googleUid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  idToken: string;
  provider: 'google' | 'email';
  lastLoginAt: string;
}

export interface GoogleSignInOptions {
  email?: string;
  displayName?: string;
  photoURL?: string;
  simulateNotificationFailure?: boolean;
}

export interface EmailSignInCredentials {
  email: string;
  password: string;
}

export interface JoinRequestInput {
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  year: string;
  reason: string;
  simulateNotificationFailure?: boolean;
}
