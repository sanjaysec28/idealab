import { Timestamp } from 'firebase/firestore';

export type AuthStateStatus =
  | 'loading'
  | 'unauthenticated'
  | 'needs_profile'
  | 'needs_timetable_warning'
  | 'needs_timetable'
  | 'timetable_review'
  | 'ready';

export type TimetableWorkflowState = 'not_started' | 'in_review' | 'finalized';

export interface StudentSocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface StudentProfileDoc {
  uid: string;
  fullName: string;
  email: string;
  authProvider?: 'google' | 'password';
  registrationNumber?: string;
  department?: string;
  degree?: string;
  academicYear?: string;
  currentAcademicYear?: string;
  currentSemester?: string;
  photoURL?: string;
  avatarPresetId?: string;
  bannerURL?: string;
  bannerPresetId?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  skills?: string[];
  interests?: string[];
  socialLinks?: StudentSocialLinks;
  profileSetupCompleted?: boolean;
  timetableWorkflowState?: TimetableWorkflowState;
  timetableAttemptsUsed?: number;
  timetableWarningAcceptedAt?: Timestamp;
  timetableLocked?: boolean;
  timetableFinalizedAt?: Timestamp;
  timetableLastModifiedBy?: string;
  timetableCompleted?: boolean;
  timetableStatus?: 'not_submitted' | 'submitted';
  timetableUpdatedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  // Legacy optional fields kept read-only so existing Firestore records load without breaking
  membershipStatus?: 'pending' | 'approved' | 'rejected';
  approvedAt?: Timestamp;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface CompleteProfileInput {
  fullName: string;
  registrationNumber: string;
  department: string;
  degree: string;
  phoneNumber: string;
  whatsappNumber: string;
}
