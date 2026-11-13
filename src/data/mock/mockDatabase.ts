import { AuthenticatedUser, MembershipStatus } from '../../types/auth';
import {
  ApprovalLogRecord,
  StudentMembership,
  StudentProfile,
} from '../../types/membership';

export interface MockDbState {
  users: Record<string, AuthenticatedUser>;
  membershipsByUserId: Record<string, StudentMembership>;
  profilesByUserId: Record<string, StudentProfile>;
  approvalLogs: ApprovalLogRecord[];
}

const DB_STORAGE_KEY = 'idealab_phase2_mock_db_v1';
const SESSION_STORAGE_KEY = 'idealab_phase2_auth_session_v1';
const CHANNEL_NAME = 'idealab_membership_sync_v1';

const SEEDED_TIME = '2026-11-12T09:30:00.000Z';

function buildSeedDb(): MockDbState {
  const ananyaUid = 'uid_ananya_sec2024101';
  const karthikUid = 'uid_karthik_sec2024205';
  const divyaUid = 'uid_divya_sec2024312';
  const rohanUid = 'uid_rohan_pending';
  const meeraUid = 'uid_meera_rejected';
  const vikramUid = 'uid_vikram_suspended';

  return {
    users: {
      [ananyaUid]: {
        uid: ananyaUid,
        googleUid: 'google_ananya.sec2024101@saveetha.ac.in',
        displayName: 'Ananya Sharma',
        email: 'ananya.sec2024101@saveetha.ac.in',
        idToken: 'mock_id_token_ananya',
        provider: 'google',
        lastLoginAt: SEEDED_TIME,
      },
      [karthikUid]: {
        uid: karthikUid,
        googleUid: 'google_karthik.sec2024205@saveetha.ac.in',
        displayName: 'Karthik Subramanian',
        email: 'karthik.sec2024205@saveetha.ac.in',
        idToken: 'mock_id_token_karthik',
        provider: 'google',
        lastLoginAt: SEEDED_TIME,
      },
      [divyaUid]: {
        uid: divyaUid,
        googleUid: 'google_divya.sec2024312@saveetha.ac.in',
        displayName: 'Divya Krishnan',
        email: 'divya.sec2024312@saveetha.ac.in',
        idToken: 'mock_id_token_divya',
        provider: 'google',
        lastLoginAt: SEEDED_TIME,
      },
      [rohanUid]: {
        uid: rohanUid,
        googleUid: 'google_rohan.pending@saveetha.ac.in',
        displayName: 'Rohan Venkatesh',
        email: 'rohan.pending@saveetha.ac.in',
        idToken: 'mock_id_token_rohan',
        provider: 'google',
        lastLoginAt: SEEDED_TIME,
      },
      [meeraUid]: {
        uid: meeraUid,
        googleUid: 'google_meera.rejected@saveetha.ac.in',
        displayName: 'Meera Nair',
        email: 'meera.rejected@saveetha.ac.in',
        idToken: 'mock_id_token_meera',
        provider: 'google',
        lastLoginAt: SEEDED_TIME,
      },
      [vikramUid]: {
        uid: vikramUid,
        googleUid: 'google_vikram.suspended@saveetha.ac.in',
        displayName: 'Vikram Sundar',
        email: 'vikram.suspended@saveetha.ac.in',
        idToken: 'mock_id_token_vikram',
        provider: 'google',
        lastLoginAt: SEEDED_TIME,
      },
    },
    membershipsByUserId: {
      [ananyaUid]: {
        userId: ananyaUid,
        googleUid: 'google_ananya.sec2024101@saveetha.ac.in',
        requestId: 'SEC-IL-1042',
        fullName: 'Ananya Sharma',
        email: 'ananya.sec2024101@saveetha.ac.in',
        rollNumber: 'SEC2024101',
        department: 'AI & Data Science',
        year: '3rd Year',
        status: MembershipStatus.APPROVED,
        requestedAt: '2026-11-01T10:00:00.000Z',
        updatedAt: '2026-11-01T14:20:00.000Z',
        reviewedAt: '2026-11-01T14:20:00.000Z',
        reviewedBy: 'coord_faculty_01',
      },
      [karthikUid]: {
        userId: karthikUid,
        googleUid: 'google_karthik.sec2024205@saveetha.ac.in',
        requestId: 'SEC-IL-2088',
        fullName: 'Karthik Subramanian',
        email: 'karthik.sec2024205@saveetha.ac.in',
        rollNumber: 'SEC2024205',
        department: 'Computer Science & Engineering',
        year: '2nd Year',
        status: MembershipStatus.APPROVED,
        requestedAt: '2026-11-10T09:15:00.000Z',
        updatedAt: '2026-11-11T11:30:00.000Z',
        reviewedAt: '2026-11-11T11:30:00.000Z',
        reviewedBy: 'coord_faculty_01',
      },
      [divyaUid]: {
        userId: divyaUid,
        googleUid: 'google_divya.sec2024312@saveetha.ac.in',
        requestId: 'SEC-IL-3104',
        fullName: 'Divya Krishnan',
        email: 'divya.sec2024312@saveetha.ac.in',
        rollNumber: 'SEC2024312',
        department: 'Electronics & Communication Engg',
        year: '3rd Year',
        status: MembershipStatus.APPROVED,
        requestedAt: '2026-11-10T10:15:00.000Z',
        updatedAt: '2026-11-11T12:00:00.000Z',
        reviewedAt: '2026-11-11T12:00:00.000Z',
        reviewedBy: 'coord_faculty_01',
      },
      [rohanUid]: {
        userId: rohanUid,
        googleUid: 'google_rohan.pending@saveetha.ac.in',
        requestId: 'SEC-IL-8492',
        fullName: 'Rohan Venkatesh',
        email: 'rohan.pending@saveetha.ac.in',
        rollNumber: 'SEC2024418',
        department: 'AI & Data Science',
        year: '2nd Year',
        status: MembershipStatus.PENDING,
        requestedAt: '2026-11-12T10:24:00.000Z',
        updatedAt: '2026-11-12T10:24:00.000Z',
      },
      [meeraUid]: {
        userId: meeraUid,
        googleUid: 'google_meera.rejected@saveetha.ac.in',
        requestId: 'SEC-IL-7319',
        fullName: 'Meera Nair',
        email: 'meera.rejected@saveetha.ac.in',
        rollNumber: 'SEC2024502',
        department: 'Information Technology',
        year: '1st Year',
        status: MembershipStatus.REJECTED,
        requestedAt: '2026-11-08T08:40:00.000Z',
        updatedAt: '2026-11-09T15:10:00.000Z',
        reviewedAt: '2026-11-09T15:10:00.000Z',
        reviewedBy: 'coord_faculty_02',
        rejectionReason:
          'Student enrollment record could not be verified with the current Saveetha IDEA Lab cohort. Please contact the lab coordinator with your college ID.',
      },
      [vikramUid]: {
        userId: vikramUid,
        googleUid: 'google_vikram.suspended@saveetha.ac.in',
        requestId: 'SEC-IL-6205',
        fullName: 'Vikram Sundar',
        email: 'vikram.suspended@saveetha.ac.in',
        rollNumber: 'SEC2023119',
        department: 'Mechanical Engineering',
        year: '4th Year',
        status: MembershipStatus.SUSPENDED,
        requestedAt: '2026-10-15T11:00:00.000Z',
        updatedAt: '2026-11-11T16:45:00.000Z',
        reviewedAt: '2026-11-11T16:45:00.000Z',
        reviewedBy: 'coord_faculty_01',
        suspensionReason:
          'Membership temporarily paused pending equipment return and IDEA Lab coordinator clearance.',
      },
    },
    profilesByUserId: {
      [ananyaUid]: {
        userId: ananyaUid,
        fullName: 'Ananya Sharma',
        email: 'ananya.sec2024101@saveetha.ac.in',
        rollNumber: 'SEC2024101',
        department: 'AI & Data Science',
        year: '3rd Year',
        semester: '5th Semester',
        section: 'A',
        session: '2026 - 2027',
        academicProfileCompleted: true,
        timetableCompleted: true,
        timetableSlotsCount: 24,
        updatedAt: '2026-11-01T14:40:00.000Z',
      },
      [karthikUid]: {
        userId: karthikUid,
        fullName: 'Karthik Subramanian',
        email: 'karthik.sec2024205@saveetha.ac.in',
        rollNumber: 'SEC2024205',
        department: 'Computer Science & Engineering',
        year: '2nd Year',
        semester: '3rd Semester',
        section: 'A',
        session: '2026 - 2027',
        academicProfileCompleted: false,
        timetableCompleted: false,
        updatedAt: '2026-11-11T11:30:00.000Z',
      },
      [divyaUid]: {
        userId: divyaUid,
        fullName: 'Divya Krishnan',
        email: 'divya.sec2024312@saveetha.ac.in',
        rollNumber: 'SEC2024312',
        department: 'Electronics & Communication Engg',
        year: '3rd Year',
        semester: '5th Semester',
        section: 'B',
        session: '2026 - 2027',
        academicProfileCompleted: true,
        timetableCompleted: false,
        updatedAt: '2026-11-11T12:15:00.000Z',
      },
      [rohanUid]: {
        userId: rohanUid,
        fullName: 'Rohan Venkatesh',
        email: 'rohan.pending@saveetha.ac.in',
        rollNumber: 'SEC2024418',
        department: 'AI & Data Science',
        year: '2nd Year',
        semester: '3rd Semester',
        section: 'A',
        session: '2026 - 2027',
        academicProfileCompleted: false,
        timetableCompleted: false,
        updatedAt: '2026-11-12T10:24:00.000Z',
      },
      [meeraUid]: {
        userId: meeraUid,
        fullName: 'Meera Nair',
        email: 'meera.rejected@saveetha.ac.in',
        rollNumber: 'SEC2024502',
        department: 'Information Technology',
        year: '1st Year',
        semester: '1st Semester',
        section: 'A',
        session: '2026 - 2027',
        academicProfileCompleted: false,
        timetableCompleted: false,
        updatedAt: '2026-11-09T15:10:00.000Z',
      },
      [vikramUid]: {
        userId: vikramUid,
        fullName: 'Vikram Sundar',
        email: 'vikram.suspended@saveetha.ac.in',
        rollNumber: 'SEC2023119',
        department: 'Mechanical Engineering',
        year: '4th Year',
        semester: '7th Semester',
        section: 'B',
        session: '2026 - 2027',
        academicProfileCompleted: true,
        timetableCompleted: true,
        updatedAt: '2026-11-11T16:45:00.000Z',
      },
    },
    approvalLogs: [
      {
        logId: 'log_seed_1',
        requestId: 'SEC-IL-1042',
        userId: ananyaUid,
        previousStatus: MembershipStatus.PENDING,
        newStatus: MembershipStatus.APPROVED,
        actorRole: 'COORDINATOR',
        actorId: 'coord_faculty_01',
        timestamp: '2026-11-01T14:20:00.000Z',
      },
      {
        logId: 'log_seed_2',
        requestId: 'SEC-IL-8492',
        userId: rohanUid,
        previousStatus: null,
        newStatus: MembershipStatus.PENDING,
        actorRole: 'SYSTEM',
        actorId: 'system_auth_sync',
        timestamp: '2026-11-12T10:24:00.000Z',
      },
    ],
  };
}

let memoryDb: MockDbState = buildSeedDb();
let memorySessionUserId: string | null = null;

type DbListener = (db: MockDbState) => void;
const listeners = new Set<DbListener>();

let broadcastChannel: BroadcastChannel | null = null;
if (typeof BroadcastChannel !== 'undefined') {
  broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  broadcastChannel.onmessage = () => {
    const latest = readDb();
    listeners.forEach((cb) => cb(latest));
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === DB_STORAGE_KEY) {
      const latest = readDb();
      listeners.forEach((cb) => cb(latest));
    }
  });
}

export function readDb(): MockDbState {
  if (typeof localStorage === 'undefined') {
    return memoryDb;
  }
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(memoryDb));
      return memoryDb;
    }
    const parsed = JSON.parse(raw) as MockDbState;
    memoryDb = parsed;
    return parsed;
  } catch {
    return memoryDb;
  }
}

export function writeDb(nextDb: MockDbState): void {
  memoryDb = nextDb;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(nextDb));
    } catch {
      // Fallback to memory
    }
  }
  listeners.forEach((cb) => cb(nextDb));
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'DB_UPDATED', at: Date.now() });
    } catch {
      // Ignore closed channel
    }
  }
}

export function subscribeDb(listener: DbListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readSessionUserId(): string | null {
  if (typeof localStorage === 'undefined') {
    return memorySessionUserId;
  }
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return memorySessionUserId;
  }
}

export function writeSessionUserId(userId: string | null): void {
  memorySessionUserId = userId;
  if (typeof localStorage !== 'undefined') {
    try {
      if (userId) {
        localStorage.setItem(SESSION_STORAGE_KEY, userId);
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }
}

export function resetMockDbForTesting(): void {
  const seed = buildSeedDb();
  writeDb(seed);
  writeSessionUserId(null);
}
