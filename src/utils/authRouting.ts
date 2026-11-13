import { AuthStateStatus, StudentProfileDoc } from '../types/auth';
import { StudentTimetableDoc } from '../types/timetable';

export const PUBLIC_OR_AUTH_PATHS = new Set([
  '/',
  '/splash',
  '/welcome',
  '/onboarding',
  '/signup',
  '/login',
  '/join',
  '/verify-email',
  '/account-suspended',
]);

export function hasSubmittedStudentTimetable(
  profile: StudentProfileDoc | null | undefined,
  timetable: StudentTimetableDoc | null | undefined
): boolean {
  if (
    timetable &&
    timetable.submissionStatus === 'submitted' &&
    Array.isArray(timetable.classes) &&
    timetable.classes.length > 0
  ) {
    return true;
  }
  return Boolean(
    profile?.timetableCompleted === true || profile?.timetableStatus === 'submitted'
  );
}

export function deriveAuthState(params: {
  isAuthReady: boolean;
  hasUser: boolean;
  emailVerified: boolean;
  isStudentDataLoaded: boolean;
  profile: StudentProfileDoc | null;
  timetable: StudentTimetableDoc | null;
}): AuthStateStatus {
  if (!params.isAuthReady) return 'loading';
  if (!params.hasUser) return 'unauthenticated';
  if (!params.emailVerified) return 'unverified_email';
  if (!params.isStudentDataLoaded) return 'loading';

  // Existing verified users with legacy membershipStatus ('pending'/'rejected') are never blocked;
  // access depends solely on verified email + timetable submission status.
  return hasSubmittedStudentTimetable(params.profile, params.timetable)
    ? 'ready'
    : 'needs_timetable';
}

export function resolveDestinationForState(
  state: AuthStateStatus,
  intendedPath?: string
): string {
  switch (state) {
    case 'unauthenticated':
      return '/welcome';
    case 'unverified_email':
      return '/verify-email';
    case 'needs_timetable':
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
