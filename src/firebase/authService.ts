import {
  browserLocalPersistence,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, authPersistenceReady, db } from './config';

const FATAL_SESSION_ERROR_CODES = new Set([
  'auth/user-disabled',
  'auth/user-not-found',
  'auth/user-token-expired',
  'auth/invalid-user-token',
  'auth/token-revoked',
  'auth/requires-recent-login',
]);

export function getFirebaseErrorCode(err: unknown): string {
  return typeof err === 'object' && err !== null && 'code' in err
    ? String((err as { code: unknown }).code)
    : '';
}

export function isSessionRevokedOrExpiredError(err: unknown): boolean {
  return FATAL_SESSION_ERROR_CODES.has(getFirebaseErrorCode(err));
}

export function mapFirebaseAuthError(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in popup is already open. Please complete or close it and try again.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not yet authorized in Firebase Authentication settings. Contact the IDEA LAB administrator.';
    case 'auth/operation-not-allowed':
      return 'Google Sign-In is not yet enabled in Firebase Console Authentication settings.';
    case 'auth/account-exists-with-different-credential':
      return 'An account with this email already exists using a different sign-in method.';
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts. Please wait a moment and try again.';
    case 'auth/user-disabled':
      return 'This student account has been disabled. Contact your IDEA LAB coordinator.';
    case 'auth/network-request-failed':
      return 'Network error while connecting to Google. Check your internet connection and try again.';
    default:
      return err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
  }
}

export const VALID_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

export function isValidEmailAddress(email: string | null | undefined): boolean {
  const normalized = normalizeEmail(email);
  if (normalized.length < 5 || normalized.length > 160) {
    return false;
  }
  const atIndex = normalized.indexOf('@');
  if (atIndex <= 0) {
    return false;
  }
  const localPart = normalized.slice(0, atIndex);
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return false;
  }
  return VALID_EMAIL_REGEX.test(normalized);
}

export function assertValidEmailAddress(email: string | null | undefined): string {
  const normalized = normalizeEmail(email);
  if (!isValidEmailAddress(normalized)) {
    throw new Error('A valid verified Google email address is required.');
  }
  return normalized;
}

export async function signInWithGoogle(): Promise<User> {
  try {
    await authPersistenceReady;
    await setPersistence(auth, browserLocalPersistence);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    if (!credential.user.email) {
      throw new Error('Google account did not return an email address.');
    }
    return credential.user;
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function reloadStudentUser(user: User): Promise<User> {
  try {
    await user.reload();
    const freshUser = auth.currentUser || user;
    if (freshUser.emailVerified) {
      const tokenResult = await freshUser.getIdTokenResult();
      if (!tokenResult.claims.email_verified) {
        await freshUser.getIdToken(true);
      }
    }
    return freshUser;
  } catch (error) {
    if (isSessionRevokedOrExpiredError(error)) {
      throw error;
    }
    throw new Error(mapFirebaseAuthError(error));
  }
}

/**
 * Validates a persisted Firebase Auth session cleanly.
 * - Returns `{ valid: true, user }` if active or if only a transient/offline network error occurred.
 * - Returns `{ valid: false, reason }` if Firebase reports the account/token was revoked, disabled, or deleted.
 */
export async function verifyActiveStudentSession(
  user: User
): Promise<{ valid: true; user: User } | { valid: false; reason: string }> {
  try {
    await user.reload();
    const freshUser = auth.currentUser || user;
    await freshUser.getIdTokenResult();
    if (freshUser.emailVerified) {
      const tokenResult = await freshUser.getIdTokenResult();
      if (!tokenResult.claims.email_verified) {
        await freshUser.getIdToken(true);
      }
    }
    return { valid: true, user: freshUser };
  } catch (error) {
    if (isSessionRevokedOrExpiredError(error)) {
      return {
        valid: false,
        reason: 'Your session expired or is no longer active. Please sign in again with Google.',
      };
    }
    // Preserve persisted session across temporary offline / transient network errors
    return { valid: true, user: auth.currentUser || user };
  }
}

export async function checkIsAdminUser(user: User | null | undefined): Promise<boolean> {
  if (!user || !user.uid) return false;
  try {
    const tokenResult = await user.getIdTokenResult();
    if (tokenResult.claims.admin === true) {
      return true;
    }
  } catch {
    // Fallback to admins/{uid} check
  }

  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    return adminSnap.exists();
  } catch {
    return false;
  }
}

export async function signOutStudentAccount(): Promise<void> {
  await signOut(auth);
}
