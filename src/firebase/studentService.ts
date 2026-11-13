import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from './config';
import { assertValidEmailAddress, getSignupDraft } from './authService';
import { handleFirestoreError, OperationType } from './errorHandling';
import { StudentProfileDoc, StudentSocialLinks } from '../types/auth';

const STUDENTS_COLLECTION = 'students';

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

async function writeStudentProfilePatch(
  uid: string,
  patch: Record<string, unknown>
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== uid) {
    throw new Error('You must be signed in as the profile owner to update your profile.');
  }

  if (!currentUser.emailVerified) {
    throw new Error('Please verify your email address before updating your profile.');
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

    // Non-fatal sync of public non-PII display metadata to availability/current if it exists
    try {
      const availabilityRef = doc(db, STUDENTS_COLLECTION, uid, 'availability', 'current');
      const availSnap = await getDoc(availabilityRef);
      if (availSnap.exists()) {
        const publicKeys = [
          'fullName',
          'department',
          'academicYear',
          'photoURL',
          'avatarPresetId',
          'skills',
        ] as const;
        const availPatch: Record<string, unknown> = { emailVerified: true };
        let hasPublicUpdate = false;
        for (const key of publicKeys) {
          if (key in patch) {
            availPatch[key] = patch[key];
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
  const draft = getSignupDraft(uid);
  const fallbackName = (
    (typeof patch.fullName === 'string' && patch.fullName.trim()) ||
    currentUser.displayName ||
    draft?.fullName ||
    verifiedEmail.split('@')[0] ||
    'IDEA Lab Student'
  )
    .trim()
    .slice(0, 100);

  const safeFullName = fallbackName.length >= 2 ? fallbackName : 'IDEA Lab Student';
  const registrationNumber = draft?.registrationNumber?.trim().toUpperCase().slice(0, 32);

  try {
    await setDoc(studentRef, {
      uid,
      fullName: safeFullName,
      email: verifiedEmail,
      ...(registrationNumber && registrationNumber.length >= 4
        ? { registrationNumber }
        : {}),
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
  academicYear: string;
  currentSemester: string;
  location: string;
  phoneNumber: string;
  bio: string;
}

export async function updateStudentProfileDetails(
  uid: string,
  updates: EditableProfileDetailsInput
): Promise<void> {
  const fullName = updates.fullName.trim().slice(0, 100);
  const department = updates.department.trim().slice(0, 80);
  const academicYear = updates.academicYear.trim().slice(0, 24);
  const currentSemester = updates.currentSemester.trim().slice(0, 24);
  const location = updates.location.trim().slice(0, 120);
  const phoneNumber = updates.phoneNumber.trim().slice(0, 32);
  const bio = updates.bio.trim().slice(0, 600);

  if (fullName.length < 2) {
    throw new Error('Full name must be at least 2 characters.');
  }
  if (department.length < 2) {
    throw new Error('Department must be at least 2 characters.');
  }
  if (academicYear.length < 2) {
    throw new Error('Academic year is required.');
  }
  if (currentSemester.length < 1) {
    throw new Error('Semester is required.');
  }
  if (phoneNumber && !/^[0-9+\-\s()]{7,24}$/.test(phoneNumber)) {
    throw new Error('Please enter a valid phone number (7–24 digits).');
  }

  await writeStudentProfilePatch(uid, {
    fullName,
    department,
    academicYear,
    currentAcademicYear: academicYear,
    currentSemester,
    location,
    phoneNumber,
    bio,
    profileSetupCompleted: true,
  });

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

