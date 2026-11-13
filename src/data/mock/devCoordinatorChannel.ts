import { MembershipStatus } from '../../types/auth';
import { ApprovalLogRecord, StudentMembership } from '../../types/membership';
import { readDb, writeDb } from './mockDatabase';

/**
 * DEV-ONLY COORDINATOR CHANNEL
 * Simulates the external Coordinator / Admin Backend transitions for testing
 * realtime approval, rejection, and suspension in the student app.
 *
 * IMPORTANT: Never import this file into student-facing UI pages (such as PendingApprovalPage).
 * Only DevStateSwitcher and test scripts may use this channel.
 */
function transitionStatus(
  userId: string,
  nextStatus: MembershipStatus,
  options?: { coordinatorId?: string; reason?: string }
): StudentMembership {
  const db = readDb();
  const existing = db.membershipsByUserId[userId];
  if (!existing) {
    throw new Error(`No membership record found for userId=${userId}`);
  }

  const now = new Date().toISOString();
  const coordinatorId = options?.coordinatorId || 'coord_dev_simulator';

  const updated: StudentMembership = {
    ...existing,
    status: nextStatus,
    updatedAt: now,
    reviewedAt: nextStatus === MembershipStatus.PENDING ? undefined : now,
    reviewedBy: nextStatus === MembershipStatus.PENDING ? undefined : coordinatorId,
    rejectionReason:
      nextStatus === MembershipStatus.REJECTED
        ? options?.reason ||
          'Membership verification could not be completed. Please reach out to the IDEA Lab coordinator.'
        : undefined,
    suspensionReason:
      nextStatus === MembershipStatus.SUSPENDED
        ? options?.reason ||
          'Access temporarily suspended pending IDEA Lab coordinator review.'
        : undefined,
  };

  const log: ApprovalLogRecord = {
    logId: `log_coord_${Date.now()}`,
    requestId: existing.requestId,
    userId,
    previousStatus: existing.status,
    newStatus: nextStatus,
    actorRole: 'COORDINATOR',
    actorId: coordinatorId,
    reason: options?.reason,
    timestamp: now,
  };

  writeDb({
    ...db,
    membershipsByUserId: {
      ...db.membershipsByUserId,
      [userId]: updated,
    },
    approvalLogs: [...db.approvalLogs, log],
  });

  return updated;
}

export const devCoordinatorChannel = {
  approveStudent(userId: string): StudentMembership {
    return transitionStatus(userId, MembershipStatus.APPROVED);
  },

  rejectStudent(userId: string, reason?: string): StudentMembership {
    return transitionStatus(userId, MembershipStatus.REJECTED, { reason });
  },

  suspendStudent(userId: string, reason?: string): StudentMembership {
    return transitionStatus(userId, MembershipStatus.SUSPENDED, { reason });
  },

  restoreStudent(userId: string): StudentMembership {
    return transitionStatus(userId, MembershipStatus.APPROVED);
  },

  resetToPending(userId: string): StudentMembership {
    return transitionStatus(userId, MembershipStatus.PENDING);
  },
};
