import { MembershipStatus } from './auth';

export interface StudentMembership {
  userId: string;
  googleUid: string;
  requestId: string;
  fullName: string;
  email: string;
  photoURL?: string;
  rollNumber?: string;
  department?: string;
  year?: string;
  reason?: string;
  status: MembershipStatus;
  requestedAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  suspensionReason?: string;
}

export interface StudentProfile {
  userId: string;
  fullName: string;
  email: string;
  rollNumber: string;
  department: string;
  year: string;
  semester: string;
  section: string;
  session: string;
  academicProfileCompleted: boolean;
  timetableCompleted: boolean;
  timetableSlotsCount?: number;
  updatedAt: string;
}

export interface ApprovalLogRecord {
  logId: string;
  requestId: string;
  userId: string;
  previousStatus: MembershipStatus | null;
  newStatus: MembershipStatus;
  actorRole: 'SYSTEM' | 'COORDINATOR';
  actorId: string;
  reason?: string;
  timestamp: string;
}

export type NotificationDeliveryStatus = 'PENDING' | 'SENT' | 'FAILED' | 'RETRYING';

export interface NotificationRecord {
  notificationId: string;
  requestId: string;
  userId: string;
  channel: 'WHATSAPP';
  recipientRole: 'COORDINATOR';
  messageBody: string;
  deliveryStatus: NotificationDeliveryStatus;
  attempts: number;
  lastError?: string;
  createdAt: string;
  sentAt?: string;
}

export interface VerificationSyncResult {
  membership: StudentMembership;
  profile: StudentProfile;
  isNewRequest: boolean;
  notification: NotificationRecord | null;
}

export class MembershipForbiddenError extends Error {
  public readonly statusCode = 403;

  constructor(message = '403 Forbidden: Students cannot modify membership status.') {
    super(message);
    this.name = 'MembershipForbiddenError';
  }
}
