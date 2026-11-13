import { MembershipStatus } from '../types/auth';
import {
  ApprovalLogRecord,
  NotificationRecord,
  StudentMembership,
  StudentProfile,
} from '../types/membership';

/**
 * Firestore Schema & Security Contracts for Firebase Drop-in.
 *
 * NOTE: This module defines typed collection schemas, security rule expectations,
 * and separate Admin/Coordinator backend API contracts. No live Firebase SDK
 * is initialized in this local development adapter.
 */

export const FIRESTORE_COLLECTIONS = {
  USERS: 'users',
  MEMBERSHIPS: 'memberships',
  STUDENT_PROFILES: 'studentProfiles',
  APPROVAL_LOGS: 'approvalLogs',
  NOTIFICATION_LOGS: 'notificationLogs',
} as const;

export interface FirestoreUserDoc {
  uid: string;
  googleUid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
}

export type FirestoreMembershipDoc = StudentMembership;
export type FirestoreStudentProfileDoc = StudentProfile;
export type FirestoreApprovalLogDoc = ApprovalLogRecord;
export type FirestoreNotificationLogDoc = NotificationRecord;

/**
 * Expected Firestore Security Rules (deploy in Firebase project when connected):
 * - Students may read only their own `users/{uid}`, `memberships/{uid}`, and `studentProfiles/{uid}` docs.
 * - Students may create an initial `memberships/{uid}` doc ONLY with `status == 'PENDING'`.
 * - Students MUST NEVER update `memberships/{uid}.status`, `reviewedAt`, `reviewedBy`,
 *   `rejectionReason`, or `suspensionReason`.
 * - Students may update `studentProfiles/{uid}` ONLY when `memberships/{uid}.status == 'APPROVED'`.
 * - `approvalLogs` and `notificationLogs` writes are restricted exclusively to Admin/Cloud Functions.
 */
export const FIRESTORE_SECURITY_CONTRACT = {
  studentCanReadOwnMembership: true,
  studentCanCreateInitialPendingRequestOnly: true,
  studentCanMutateMembershipStatus: false,
  studentCanAccessProfileBeforeApproval: false,
  coordinatorWritesRequireAdminClaimOrCloudFunction: true,
} as const;

/**
 * Backend / Cloud Function Contracts for the SEPARATE Admin & Coordinator Application.
 * The Student Application never invokes coordinator approval endpoints directly.
 */
export interface AdminBackendApiContract {
  getPendingRequests: () => Promise<StudentMembership[]>;
  approveMembership: (params: {
    requestId: string;
    coordinatorId: string;
  }) => Promise<{ status: MembershipStatus.APPROVED; reviewedAt: string }>;
  rejectMembership: (params: {
    requestId: string;
    coordinatorId: string;
    reason: string;
  }) => Promise<{ status: MembershipStatus.REJECTED; reviewedAt: string; reason: string }>;
  suspendMembership: (params: {
    requestId: string;
    coordinatorId: string;
    reason: string;
  }) => Promise<{ status: MembershipStatus.SUSPENDED; reviewedAt: string; reason: string }>;
  restoreMembership: (params: {
    requestId: string;
    coordinatorId: string;
  }) => Promise<{ status: MembershipStatus.APPROVED; reviewedAt: string }>;
}
