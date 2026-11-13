import { AuthenticatedUser, JoinRequestInput, MembershipStatus } from '../../types/auth';
import {
  ApprovalLogRecord,
  MembershipForbiddenError,
  NotificationRecord,
  StudentMembership,
  StudentProfile,
  VerificationSyncResult,
} from '../../types/membership';
import { notificationService } from '../../services/notifications/notificationService';
import { readDb, subscribeDb, writeDb } from './mockDatabase';

export interface MembershipServiceAdapter {
  verifyAndSyncMembership: (
    user: AuthenticatedUser,
    options?: {
      joinDetails?: Partial<JoinRequestInput>;
      simulateNotificationFailure?: boolean;
    }
  ) => Promise<VerificationSyncResult>;
  getMembershipByUserId: (userId: string) => Promise<StudentMembership | null>;
  getProfileByUserId: (userId: string) => Promise<StudentProfile | null>;
  attemptStudentStatusMutation: (
    userId: string,
    targetStatus: MembershipStatus
  ) => Promise<never>;
  completeAcademicProfile: (
    userId: string,
    profileInput: {
      fullName: string;
      rollNumber: string;
      department: string;
      year: string;
      semester: string;
      section: string;
      session: string;
    }
  ) => Promise<StudentProfile>;
  completeTimetableSetup: (
    userId: string,
    slotsCount?: number
  ) => Promise<StudentProfile>;
  subscribeToMembership: (
    userId: string,
    callback: (payload: {
      membership: StudentMembership | null;
      profile: StudentProfile | null;
    }) => void
  ) => () => void;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateRequestId(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i += 1) {
    hash = (hash * 31 + email.charCodeAt(i)) % 9000;
  }
  const code = 1000 + Math.abs(hash);
  return `SEC-IL-${code}`;
}

export const mockMembershipService: MembershipServiceAdapter = {
  async verifyAndSyncMembership(
    user: AuthenticatedUser,
    options?: {
      joinDetails?: Partial<JoinRequestInput>;
      simulateNotificationFailure?: boolean;
    }
  ): Promise<VerificationSyncResult> {
    const db = readDb();
    const normalizedEmail = normalizeEmail(user.email);

    // 1. Lookup existing membership by userId, googleUid, or normalized email
    const existingMembership =
      db.membershipsByUserId[user.uid] ||
      Object.values(db.membershipsByUserId).find(
        (m) =>
          m.googleUid === user.googleUid || normalizeEmail(m.email) === normalizedEmail
      );

    if (existingMembership) {
      const existingProfile = db.profilesByUserId[existingMembership.userId] || {
        userId: existingMembership.userId,
        fullName: existingMembership.fullName,
        email: existingMembership.email,
        rollNumber: existingMembership.rollNumber || '',
        department: existingMembership.department || 'AI & Data Science',
        year: existingMembership.year || '3rd Year',
        semester: '5th Semester',
        section: 'A',
        session: '2026 - 2027',
        academicProfileCompleted: false,
        timetableCompleted: false,
        updatedAt: new Date().toISOString(),
      };

      if (!db.profilesByUserId[existingMembership.userId]) {
        writeDb({
          ...db,
          profilesByUserId: {
            ...db.profilesByUserId,
            [existingMembership.userId]: existingProfile,
          },
        });
      }

      // Idempotent: do NOT recreate request or re-send notification on repeat sign-in
      const existingNotification: NotificationRecord | null =
        notificationService.getByRequestId(existingMembership.requestId);

      return {
        membership: existingMembership,
        profile: existingProfile,
        isNewRequest: false,
        notification: existingNotification,
      };
    }

    // 2. First-time user: create ONE PENDING membership request (never auto-approved!)
    const now = new Date().toISOString();
    const requestId = generateRequestId(`${normalizedEmail}_${now}`);
    const fullName = options?.joinDetails?.name?.trim() || user.displayName;

    const newMembership: StudentMembership = {
      userId: user.uid,
      googleUid: user.googleUid,
      requestId,
      fullName,
      email: normalizedEmail,
      photoURL: user.photoURL,
      rollNumber: options?.joinDetails?.rollNumber?.trim() || '',
      department: options?.joinDetails?.department || 'Computer Science & Engineering',
      year: options?.joinDetails?.year || '3rd Year',
      reason: options?.joinDetails?.reason?.trim() || 'Google Sign-In Membership Request',
      status: MembershipStatus.PENDING,
      requestedAt: now,
      updatedAt: now,
    };

    const newProfile: StudentProfile = {
      userId: user.uid,
      fullName,
      email: normalizedEmail,
      rollNumber: newMembership.rollNumber || '',
      department: newMembership.department || 'AI & Data Science',
      year: newMembership.year || '3rd Year',
      semester: '5th Semester',
      section: 'A',
      session: '2026 - 2027',
      academicProfileCompleted: false,
      timetableCompleted: false,
      updatedAt: now,
    };

    const initialLog: ApprovalLogRecord = {
      logId: `log_${requestId}_${Date.now()}`,
      requestId,
      userId: user.uid,
      previousStatus: null,
      newStatus: MembershipStatus.PENDING,
      actorRole: 'SYSTEM',
      actorId: 'system_auth_sync',
      timestamp: now,
    };

    writeDb({
      ...db,
      membershipsByUserId: {
        ...db.membershipsByUserId,
        [user.uid]: newMembership,
      },
      profilesByUserId: {
        ...db.profilesByUserId,
        [user.uid]: newProfile,
      },
      approvalLogs: [...db.approvalLogs, initialLog],
    });

    // 3. Trigger WhatsApp coordinator notification asynchronously / safely without blocking request persistence
    const notification = await notificationService.notifyCoordinatorOfNewLogin(
      newMembership,
      { simulateFailure: options?.simulateNotificationFailure }
    );

    return {
      membership: newMembership,
      profile: newProfile,
      isNewRequest: true,
      notification,
    };
  },

  async getMembershipByUserId(userId: string): Promise<StudentMembership | null> {
    const db = readDb();
    return db.membershipsByUserId[userId] ?? null;
  },

  async getProfileByUserId(userId: string): Promise<StudentProfile | null> {
    const db = readDb();
    return db.profilesByUserId[userId] ?? null;
  },

  async attemptStudentStatusMutation(
    _userId: string,
    _targetStatus: MembershipStatus
  ): Promise<never> {
    throw new MembershipForbiddenError(
      '403 Forbidden: Students are not permitted to modify membership approval status.'
    );
  },

  async completeAcademicProfile(
    userId: string,
    profileInput: {
      fullName: string;
      rollNumber: string;
      department: string;
      year: string;
      semester: string;
      section: string;
      session: string;
    }
  ): Promise<StudentProfile> {
    const db = readDb();
    const membership = db.membershipsByUserId[userId];
    if (!membership || membership.status !== MembershipStatus.APPROVED) {
      throw new MembershipForbiddenError(
        '403 Forbidden: Academic profile setup requires an approved IDEA LAB membership.'
      );
    }

    const existing = db.profilesByUserId[userId];
    const now = new Date().toISOString();
    const updatedProfile: StudentProfile = {
      userId,
      fullName: profileInput.fullName.trim(),
      email: membership.email,
      rollNumber: profileInput.rollNumber.trim(),
      department: profileInput.department,
      year: profileInput.year,
      semester: profileInput.semester,
      section: profileInput.section,
      session: profileInput.session,
      academicProfileCompleted: true,
      timetableCompleted: existing?.timetableCompleted ?? false,
      timetableSlotsCount: existing?.timetableSlotsCount,
      updatedAt: now,
    };

    writeDb({
      ...db,
      membershipsByUserId: {
        ...db.membershipsByUserId,
        [userId]: {
          ...membership,
          fullName: updatedProfile.fullName,
          rollNumber: updatedProfile.rollNumber,
          department: updatedProfile.department,
          year: updatedProfile.year,
          updatedAt: now,
        },
      },
      profilesByUserId: {
        ...db.profilesByUserId,
        [userId]: updatedProfile,
      },
    });

    return updatedProfile;
  },

  async completeTimetableSetup(
    userId: string,
    slotsCount = 18
  ): Promise<StudentProfile> {
    const db = readDb();
    const membership = db.membershipsByUserId[userId];
    if (!membership || membership.status !== MembershipStatus.APPROVED) {
      throw new MembershipForbiddenError(
        '403 Forbidden: Timetable setup requires an approved IDEA LAB membership.'
      );
    }

    const existing = db.profilesByUserId[userId];
    if (!existing || !existing.academicProfileCompleted) {
      throw new Error('Please complete your academic profile before timetable setup.');
    }

    const now = new Date().toISOString();
    const updatedProfile: StudentProfile = {
      ...existing,
      timetableCompleted: true,
      timetableSlotsCount: slotsCount,
      updatedAt: now,
    };

    writeDb({
      ...db,
      profilesByUserId: {
        ...db.profilesByUserId,
        [userId]: updatedProfile,
      },
    });

    return updatedProfile;
  },

  subscribeToMembership(
    userId: string,
    callback: (payload: {
      membership: StudentMembership | null;
      profile: StudentProfile | null;
    }) => void
  ): () => void {
    return subscribeDb((db) => {
      callback({
        membership: db.membershipsByUserId[userId] ?? null,
        profile: db.profilesByUserId[userId] ?? null,
      });
    });
  },
};
