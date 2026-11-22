import { AuthStateStatus, StudentProfileDoc } from '../types/auth';
import { StudentTimetableDoc } from '../types/timetable';
import { isValidPhoneNumber, isValidRegistrationNumber } from './academicConstants';

export const PUBLIC_OR_AUTH_PATHS = new Set([
  '/',
  '/splash',
  '/welcome',
  '/complete-profile',
  '/onboarding',
  '/signup',
  '/login',
  '/signin',
  '/join',
  '/verify-email',
  '/account-suspended',
]);

export function isStudentProfileComplete(profile: StudentProfileDoc | null | undefined): boolean {
  if (!profile) return false;
  if (profile.profileSetupCompleted !== true) return false;
  if ((profile.fullName ?? '').trim().length < 2) return false;
  if (!isValidRegistrationNumber(profile.registrationNumber)) return false;
  if ((profile.department ?? '').trim().length < 2) return false;
  if ((profile.degree ?? '').trim().length < 2) return false;
  if (!isValidPhoneNumber(profile.phoneNumber)) return false;
  if (!isValidPhoneNumber(profile.whatsappNumber)) return false;
  return true;
}

export function hasFinalizedStudentTimetable(
  profile: StudentProfileDoc | null | undefined,
  timetable: StudentTimetableDoc | null | undefined
): boolean {
  if (
    timetable &&
    (timetable.isLocked === true ||
      timetable.submissionStatus === 'finalized' ||
      timetable.submissionStatus === 'submitted') &&
    Array.isArray(timetable.classes) &&
    timetable.classes.length > 0
  ) {
    return true;
  }

  return Boolean(
    profile?.timetableLocked === true ||
      profile?.timetableWorkflowState === 'finalized' ||
      profile?.timetableCompleted === true ||
      profile?.timetableStatus === 'submitted'
  );
}

export function isTimetableInReviewState(
  profile: StudentProfileDoc | null | undefined,
  timetable: StudentTimetableDoc | null | undefined
): boolean {
  if (hasFinalizedStudentTimetable(profile, timetable)) {
    return false;
  }
  if (
    timetable &&
    timetable.submissionStatus === 'in_review' &&
    timetable.isLocked !== true
  ) {
    return true;
  }
  return Boolean(
    profile?.timetableWorkflowState === 'in_review' && profile?.timetableLocked !== true
  );
}

export function hasSubmittedStudentTimetable(
  profile: StudentProfileDoc | null | undefined,
  timetable: StudentTimetableDoc | null | undefined
): boolean {
  return hasFinalizedStudentTimetable(profile, timetable);
}

export function deriveAuthState(params: {
  isAuthReady: boolean;
  hasUser: boolean;
  isStudentDataLoaded: boolean;
  profile: StudentProfileDoc | null;
  timetable: StudentTimetableDoc | null;
}): AuthStateStatus {
  if (!params.isAuthReady) return 'loading';
  if (!params.hasUser) return 'unauthenticated';
  if (!params.isStudentDataLoaded) return 'loading';

  if (!isStudentProfileComplete(params.profile)) {
    return 'needs_profile';
  }

  if (hasFinalizedStudentTimetable(params.profile, params.timetable)) {
    return 'ready';
  }

  if (isTimetableInReviewState(params.profile, params.timetable)) {
    return 'timetable_review';
  }

  if (!params.profile?.timetableWarningAcceptedAt) {
    return 'needs_timetable_warning';
  }

  return 'needs_timetable';
}

export function resolveDestinationForState(
  state: AuthStateStatus,
  intendedPath?: string
): string {
  switch (state) {
    case 'unauthenticated':
      return '/welcome';
    case 'needs_profile':
      return '/complete-profile';
    case 'needs_timetable_warning':
    case 'needs_timetable':
    case 'timetable_review':
      return '/timetable';
    case 'ready': {
      const normalized = intendedPath ? intendedPath.split('?')[0] : '';
      if (intendedPath && !PUBLIC_OR_AUTH_PATHS.has(normalized)) {
        return intendedPath;
      }
      return '/home';
    }
    case 'loading':
    default:
      return '/welcome';
  }
}
