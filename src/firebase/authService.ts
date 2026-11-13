import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from './config';
import { SignupDraft, SignupInput, SignInInput } from '../types/auth';

const SIGNUP_DRAFT_PREFIX = 'idealab_signup_draft_';

export function saveSignupDraft(uid: string, draft: SignupDraft): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(`${SIGNUP_DRAFT_PREFIX}${uid}`, JSON.stringify(draft));
  } catch {
    // Ignore storage errors
  }
}

export function getSignupDraft(uid: string): SignupDraft | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(`${SIGNUP_DRAFT_PREFIX}${uid}`);
    return raw ? (JSON.parse(raw) as SignupDraft) : null;
  } catch {
    return null;
  }
}

export function clearSignupDraft(uid: string): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(`${SIGNUP_DRAFT_PREFIX}${uid}`);
  } catch {
    // Ignore
  }
}

export function mapFirebaseAuthError(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters with letters and numbers.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment before trying again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact your IDEA LAB coordinator.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled before completion.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in Firebase Console Authentication settings.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return err instanceof Error ? err.message : 'Authentication failed. Please try again.';
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
    throw new Error('Please enter a valid email address.');
  }
  return normalized;
}

export async function registerStudentAccount(input: SignupInput): Promise<User> {
  const email = assertValidEmailAddress(input.email);
  const fullName = input.fullName.trim();
  const registrationNumber = input.registrationNumber.trim().toUpperCase();

  try {
    await setPersistence(auth, browserLocalPersistence);
    const credential = await createUserWithEmailAndPassword(auth, email, input.password);
    await updateProfile(credential.user, { displayName: fullName });
    saveSignupDraft(credential.user.uid, { fullName, registrationNumber });
    await sendEmailVerification(credential.user);
    return credential.user;
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function signInStudentAccount(input: SignInInput): Promise<User> {
  const email = assertValidEmailAddress(input.email);
  try {
    await setPersistence(
      auth,
      input.rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
    const credential = await signInWithEmailAndPassword(auth, email, input.password);
    return credential.user;
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function signInStudentWithGoogle(): Promise<User> {
  try {
    await setPersistence(auth, browserLocalPersistence);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });
    const credential = await signInWithPopup(auth, provider);
    return credential.user;
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function resendStudentVerificationEmail(user: User): Promise<void> {
  assertValidEmailAddress(user.email);
  try {
    await sendEmailVerification(user);
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
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function sendStudentPasswordReset(email: string): Promise<void> {
  const normalized = assertValidEmailAddress(email);
  try {
    await sendPasswordResetEmail(auth, normalized);
  } catch (error) {
    throw new Error(mapFirebaseAuthError(error));
  }
}

export async function signOutStudentAccount(): Promise<void> {
  await signOut(auth);
}
