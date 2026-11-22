import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from './config';
import { assertValidEmailAddress } from './authService';
import { handleFirestoreError, OperationType } from './errorHandling';
import {
  CompleteProfileInput,
  StudentProfileDoc,
  StudentSocialLinks,
} from '../types/auth';
import {
  isValidPhoneNumber,
  isValidRegistrationNumber,
  normalizeRegistrationNumber,
} from '../utils/academicConstants';

const STUDENTS_COLLECTION = 'students';
const REG_NUMBERS_COLLECTION = 'registrationNumbers';

export function normalizeUrlInput(raw: string | undefined): string {
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.slice(0, 300);
  }
  return `https://${trimmed}`.slice(0, 300);
}

export function validateSocialUrl(
  url: string | undefined,
  kind: 'linkedin' | 'github' | 'portfolio'
): { valid: boolean; normalized: string; error?: string } {
  const normalized = normalizeUrlInput(url);
  if (!normalized) {
    return { valid: true, normalized: '' };
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      valid: false,
      normalized,
      error: `Please enter a valid ${kind === 'linkedin' ? 'LinkedIn' : kind === 'github' ? 'GitHub' : 'Portfolio'} URL.`,
    };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      normalized,
      error: 'URL must start with https:// or http://.',
    };
  }

  const host = parsed.hostname.toLowerCase();
  if (kind === 'linkedin' && !host.includes('linkedin.com')) {
    return {
      valid: false,
      normalized,
      error: 'LinkedIn URL must be a valid linkedin.com profile link.',
    };
  }

  if (kind === 'github' && !host.includes('github.com')) {
    return {
      valid: false,
      normalized,
      error: 'GitHub URL must be a valid github.com profile link.',
    };
  }

  if (!host.includes('.')) {
    return {
      valid: false,
      normalized,
      error: 'Please enter a complete website domain (e.g., https://yourname.dev).',
    };
  }

  return { valid: true, normalized: parsed.toString().slice(0, 300) };
}

export function sanitizeTagList(tags: string[], maxItems = 25, maxLen = 60): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of tags) {
    const cleaned = raw.trim().replace(/\s+/g, ' ').slice(0, maxLen);
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
    if (result.length >= maxItems) break;
  }

  return result;
}

export async function getStudentProfile(uid: string): Promise<StudentProfileDoc | null> {
  const docPath = `${STUDENTS_COLLECTION}/${uid}`;
  try {
    const snapshot = await getDoc(doc(db, STUDENTS_COLLECTION, uid));
    if (!snapshot.exists()) {
      return null;
    }
    return snapshot.data() as StudentProfileDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

export function subscribeToStudentProfile(
  uid: string,
  onData: (profile: StudentProfileDoc | null) => void,
  onError?: (error: Error) => void
): () => void {
  const docPath = `${STUDENTS_COLLECTION}/${uid}`;
  return onSnapshot(
    doc(db, STUDENTS_COLLECTION, uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      onData(snapshot.data() as StudentProfileDoc);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, docPath);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export async function checkRegistrationNumberAvailability(
  rawRegNo: string,
  currentUid?: string
): Promise<{ validFormat: boolean; available: boolean; normalized: string }> {
  const normalized = normalizeRegistrationNumber(rawRegNo);
  if (!isValidRegistrationNumber(normalized)) {
    return { validFormat: false, available: false, normalized };
  }

  const docPath = `${REG_NUMBERS_COLLECTION}/${normalized}`;
  try {
    const snap = await getDoc(doc(db, REG_NUMBERS_COLLECTION, normalized));
    if (!snap.exists()) {
      return { validFormat: true, available: true, normalized };
    }
    const ownerUid = (snap.data() as { uid?: string } | undefined)?.uid;
    return {
      validFormat: true,
      available: Boolean(currentUid && ownerUid === currentUid),
      normalized,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

export async function completeStudentProfile(
  uid: string,
  input: CompleteProfileInput
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== uid) {
    throw new Error('Your session expired. Please sign in again with Google.');
  }

  if (!currentUser.emailVerified) {
    await currentUser.reload();
  }
  const refreshedUser = auth.currentUser || currentUser;
  if (!refreshedUser.emailVerified) {
    throw new Error('A verified Google account is required to save your profile.');
  }
  try {
    const tokenResult = await refreshedUser.getIdTokenResult();
    if (!tokenResult.claims.email_verified) {
      await refreshedUser.getIdToken(true);
    }
  } catch {
    // Non-fatal token check
  }

  const verifiedEmail = assertValidEmailAddress(refreshedUser.email);
  const fullName = input.fullName.trim().slice(0, 100);
  const registrationNumber = normalizeRegistrationNumber(input.registrationNumber).slice(0, 32);
  const department = input.department.trim().slice(0, 80);
  const degree = input.degree.trim().slice(0, 40);
  const phoneNumber = input.phoneNumber.trim().slice(0, 32);
  const whatsappNumber = input.whatsappNumber.trim().slice(0, 32);

  if (fullName.length < 2) {
    throw new Error('Full Name must be at least 2 characters.');
  }
  if (!isValidRegistrationNumber(registrationNumber)) {
    throw new Error(
      'Registration Number must be 4–32 uppercase letters, numbers, or hyphens.'
    );
  }
  if (department.length < 2) {
    throw new Error('Please select your academic department.');
  }
  if (degree.length < 2) {
    throw new Error('Please select your degree program.');
  }
  if (!isValidPhoneNumber(phoneNumber)) {
    throw new Error('Please enter a valid phone number (7–24 characters).');
  }
  if (!isValidPhoneNumber(whatsappNumber)) {
    throw new Error('Please enter a valid WhatsApp number (7–24 characters).');
  }

  const studentRef = doc(db, STUDENTS_COLLECTION, uid);
  const regLockRef = doc(db, REG_NUMBERS_COLLECTION, registrationNumber);
  const docPath = `${STUDENTS_COLLECTION}/${uid}`;

  try {
    await runTransaction(db, async (tx) => {
      const [studentSnap, regLockSnap] = await Promise.all([
        tx.get(studentRef),
        tx.get(regLockRef),
      ]);

      if (regLockSnap.exists()) {
        const lockData = regLockSnap.data() as { uid?: string };
        if (lockData.uid && lockData.uid !== uid) {
          throw new Error(
            'This Registration Number is already registered to another student.'
          );
        }
      }

      if (studentSnap.exists()) {
        const existing = studentSnap.data() as StudentProfileDoc;
        if (
          existing.registrationNumber &&
          normalizeRegistrationNumber(existing.registrationNumber) !== registrationNumber
        ) {
          throw new Error(
            'Your Registration Number is already registered and cannot be changed.'
          );
        }

        if (!regLockSnap.exists()) {
          tx.set(regLockRef, {
            uid,
            createdAt: serverTimestamp(),
          });
        }

        tx.update(studentRef, {
          fullName,
          authProvider: 'google',
          ...(existing.registrationNumber ? {} : { registrationNumber }),
          department,
          degree,
          phoneNumber,
          whatsappNumber,
          profileSetupCompleted: true,
          updatedAt: serverTimestamp(),
        });
      } else {
        if (!regLockSnap.exists()) {
          tx.set(regLockRef, {
            uid,
            createdAt: serverTimestamp(),
          });
        }

        const cleanPhotoUrl =
          currentUser.photoURL && currentUser.photoURL.trim().length > 0
            ? currentUser.photoURL.trim().slice(0, 1000)
            : undefined;

        tx.set(studentRef, {
          uid,
          fullName,
          email: verifiedEmail,
          authProvider: 'google',
          registrationNumber,
          department,
          degree,
          phoneNumber,
          whatsappNumber,
          ...(cleanPhotoUrl ? { photoURL: cleanPhotoUrl } : {}),
          profileSetupCompleted: true,
          timetableWorkflowState: 'not_started',
          timetableAttemptsUsed: 0,
          timetableLocked: false,
          timetableCompleted: false,
          timetableStatus: 'not_submitted',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('Registration Number') ||
        error.message.includes('already registered'))
    ) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }

  // Non-fatal sync to Auth displayName & availability/current metadata if present
  if (auth.currentUser && auth.currentUser.uid === uid && auth.currentUser.displayName !== fullName) {
    try {
      await updateProfile(auth.currentUser, { displayName: fullName });
    } catch {
      // Non-fatal
    }
  }

  try {
    const availabilityRef = doc(db, STUDENTS_COLLECTION, uid, 'availability', 'current');
    const availSnap = await getDoc(availabilityRef);
    if (availSnap.exists()) {
      await updateDoc(availabilityRef, {
        fullName,
        department,
        degree,
        phoneNumber,
        whatsappNumber,
        profileComplete: true,
        emailVerified: true,
        updatedAt: serverTimestamp(),
      });
    }
  } catch {
    // Non-fatal sync
  }
}

async function writeStudentProfilePatch(
  uid: string,
  patch: Record<string, unknown>
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== uid) {
    throw new Error('You must be signed in as the profile owner to update your profile.');
  }

  if (!currentUser.emailVerified) {
    throw new Error('A verified Google account is required to update your profile.');
  }

  const docPath = `${STUDENTS_COLLECTION}/${uid}`;
  const studentRef = doc(db, STUDENTS_COLLECTION, uid);

  let existingSnap;
  try {
    existingSnap = await getDoc(studentRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }

  if (existingSnap.exists()) {
    try {
      await updateDoc(studentRef, {
        ...patch,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, docPath);
    }

    // Non-fatal sync of public collaboration display metadata to availability/current if it exists
    try {
      const availabilityRef = doc(db, STUDENTS_COLLECTION, uid, 'availability', 'current');
      const availSnap = await getDoc(availabilityRef);
      if (availSnap.exists()) {
        const publicKeys = [
          'fullName',
          'department',
          'degree',
          'academicYear',
          'photoURL',
          'avatarPresetId',
          'skills',
          'phoneNumber',
          'whatsappNumber',
          'profileSetupCompleted',
        ] as const;
        const availPatch: Record<string, unknown> = { emailVerified: true };
        let hasPublicUpdate = false;
        for (const key of publicKeys) {
          if (key in patch) {
            if (key === 'profileSetupCompleted') {
              availPatch.profileComplete = Boolean(patch[key]);
            } else {
              availPatch[key] = patch[key];
            }
            hasPublicUpdate = true;
          }
        }
        if (hasPublicUpdate) {
          await updateDoc(availabilityRef, {
            ...availPatch,
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch {
      // Non-fatal background sync
    }
    return;
  }

  const verifiedEmail = assertValidEmailAddress(currentUser.email);
  const fallbackName = (
    (typeof patch.fullName === 'string' && patch.fullName.trim()) ||
    currentUser.displayName ||
    verifiedEmail.split('@')[0] ||
    'IDEA Lab Student'
  )
    .trim()
    .slice(0, 100);

  const safeFullName = fallbackName.length >= 2 ? fallbackName : 'IDEA Lab Student';

  try {
    await setDoc(studentRef, {
      uid,
      fullName: safeFullName,
      email: verifiedEmail,
      authProvider: 'google',
      ...patch,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export interface EditableProfileDetailsInput {
  fullName: string;
  department: string;
  degree: string;
  academicYear?: string;
  currentSemester?: string;
  location: string;
  phoneNumber: string;
  whatsappNumber: string;
  bio: string;
}

export async function updateStudentProfileDetails(
  uid: string,
  updates: EditableProfileDetailsInput
): Promise<void> {
  const fullName = updates.fullName.trim().slice(0, 100);
  const department = updates.department.trim().slice(0, 80);
  const degree = updates.degree.trim().slice(0, 40);
  const academicYear = (updates.academicYear ?? '').trim().slice(0, 24);
  const currentSemester = (updates.currentSemester ?? '').trim().slice(0, 24);
  const location = updates.location.trim().slice(0, 120);
  const phoneNumber = updates.phoneNumber.trim().slice(0, 32);
  const whatsappNumber = updates.whatsappNumber.trim().slice(0, 32);
  const bio = updates.bio.trim().slice(0, 600);

  if (fullName.length < 2) {
    throw new Error('Full name must be at least 2 characters.');
  }
  if (department.length < 2) {
    throw new Error('Department must be at least 2 characters.');
  }
  if (degree.length < 2) {
    throw new Error('Degree must be at least 2 characters.');
  }
  if (!isValidPhoneNumber(phoneNumber)) {
    throw new Error('Please enter a valid phone number (7–24 digits).');
  }
  if (!isValidPhoneNumber(whatsappNumber)) {
    throw new Error('Please enter a valid WhatsApp number (7–24 digits).');
  }

  const patch: Record<string, unknown> = {
    fullName,
    department,
    degree,
    location,
    phoneNumber,
    whatsappNumber,
    bio,
    profileSetupCompleted: true,
  };

  if (academicYear.length >= 2) {
    patch.academicYear = academicYear;
    patch.currentAcademicYear = academicYear;
  }
  if (currentSemester.length >= 1) {
    patch.currentSemester = currentSemester;
  }

  await writeStudentProfilePatch(uid, patch);

  if (auth.currentUser && auth.currentUser.uid === uid && auth.currentUser.displayName !== fullName) {
    try {
      await updateProfile(auth.currentUser, { displayName: fullName });
    } catch {
      // Non-fatal if Auth displayName sync fails transiently
    }
  }
}

export async function updateStudentSkillsAndInterests(
  uid: string,
  params: {
    skills?: string[];
    interests?: string[];
  }
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (params.skills !== undefined) {
    patch.skills = sanitizeTagList(params.skills, 25, 60);
  }
  if (params.interests !== undefined) {
    patch.interests = sanitizeTagList(params.interests, 25, 60);
  }
  await writeStudentProfilePatch(uid, patch);
}

export async function updateStudentSocialLinks(
  uid: string,
  links: StudentSocialLinks
): Promise<StudentSocialLinks> {
  const linkedinCheck = validateSocialUrl(links.linkedin, 'linkedin');
  if (!linkedinCheck.valid) {
    throw new Error(linkedinCheck.error);
  }

  const githubCheck = validateSocialUrl(links.github, 'github');
  if (!githubCheck.valid) {
    throw new Error(githubCheck.error);
  }

  const portfolioCheck = validateSocialUrl(links.portfolio, 'portfolio');
  if (!portfolioCheck.valid) {
    throw new Error(portfolioCheck.error);
  }

  const sanitized: StudentSocialLinks = {
    linkedin: linkedinCheck.normalized,
    github: githubCheck.normalized,
    portfolio: portfolioCheck.normalized,
  };

  await writeStudentProfilePatch(uid, {
    socialLinks: sanitized,
  });

  return sanitized;
}

export async function updateStudentCoverBanner(
  uid: string,
  params: {
    bannerURL: string;
    bannerPresetId: string;
  }
): Promise<void> {
  const bannerURL = params.bannerURL.trim().slice(0, 1000);
  const bannerPresetId = params.bannerPresetId.trim().slice(0, 64);

  await writeStudentProfilePatch(uid, {
    bannerURL,
    bannerPresetId,
  });
}

export async function updateStudentProfilePhoto(
  uid: string,
  params: {
    photoURL: string;
    avatarPresetId: string;
  }
): Promise<void> {
  const photoURL = params.photoURL.trim().slice(0, 1000);
  const avatarPresetId = params.avatarPresetId.trim().slice(0, 64);

  await writeStudentProfilePatch(uid, {
    photoURL,
    avatarPresetId,
  });

  if (auth.currentUser && auth.currentUser.uid === uid) {
    try {
      await updateProfile(auth.currentUser, {
        photoURL: photoURL || '',
      });
    } catch {
      // Non-fatal if Firebase Auth photoURL sync fails transiently
    }
  }
}
