import { AuthenticatedUser, EmailSignInCredentials, GoogleSignInOptions } from '../../types/auth';
import {
  readDb,
  readSessionUserId,
  writeDb,
  writeSessionUserId,
} from './mockDatabase';

export interface AuthServiceAdapter {
  getCurrentUser: () => Promise<AuthenticatedUser | null>;
  signInWithGoogle: (options?: GoogleSignInOptions) => Promise<AuthenticatedUser>;
  signInWithEmail: (credentials: EmailSignInCredentials) => Promise<AuthenticatedUser>;
  signOut: () => Promise<void>;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function deriveUidFromEmail(email: string): string {
  const normalized = normalizeEmail(email);
  const slug = normalized.replace(/[^a-z0-9]/g, '_');
  return `uid_${slug}`;
}

function inferDisplayNameFromEmail(email: string): string {
  const local = email.split('@')[0] || 'IDEA Lab Student';
  return local
    .split(/[._+-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const mockAuthService: AuthServiceAdapter = {
  async getCurrentUser(): Promise<AuthenticatedUser | null> {
    const userId = readSessionUserId();
    if (!userId) return null;
    const db = readDb();
    return db.users[userId] ?? null;
  },

  async signInWithGoogle(options?: GoogleSignInOptions): Promise<AuthenticatedUser> {
    const db = readDb();
    const rawEmail =
      options?.email?.trim() ||
      `new.student.${Math.floor(1000 + Math.random() * 9000)}@saveetha.ac.in`;
    const email = normalizeEmail(rawEmail);

    const existingUser = Object.values(db.users).find(
      (u) => normalizeEmail(u.email) === email
    );

    const now = new Date().toISOString();

    if (existingUser) {
      const updatedUser: AuthenticatedUser = {
        ...existingUser,
        displayName: options?.displayName || existingUser.displayName,
        photoURL: options?.photoURL || existingUser.photoURL,
        provider: 'google',
        lastLoginAt: now,
      };
      writeDb({
        ...db,
        users: {
          ...db.users,
          [existingUser.uid]: updatedUser,
        },
      });
      writeSessionUserId(existingUser.uid);
      return updatedUser;
    }

    const uid = deriveUidFromEmail(email);
    const newUser: AuthenticatedUser = {
      uid,
      googleUid: `google_${email}`,
      displayName: options?.displayName?.trim() || inferDisplayNameFromEmail(email),
      email,
      photoURL: options?.photoURL,
      idToken: `mock_google_id_token_${uid}_${Date.now()}`,
      provider: 'google',
      lastLoginAt: now,
    };

    writeDb({
      ...db,
      users: {
        ...db.users,
        [uid]: newUser,
      },
    });
    writeSessionUserId(uid);
    return newUser;
  },

  async signInWithEmail(credentials: EmailSignInCredentials): Promise<AuthenticatedUser> {
    const email = normalizeEmail(credentials.email);
    if (!email || !credentials.password || credentials.password.length < 4) {
      throw new Error('Please enter a valid Saveetha email and password (min 4 characters).');
    }

    const db = readDb();
    const existingUser = Object.values(db.users).find(
      (u) => normalizeEmail(u.email) === email
    );
    const now = new Date().toISOString();

    if (existingUser) {
      const updatedUser: AuthenticatedUser = {
        ...existingUser,
        lastLoginAt: now,
      };
      writeDb({
        ...db,
        users: {
          ...db.users,
          [existingUser.uid]: updatedUser,
        },
      });
      writeSessionUserId(existingUser.uid);
      return updatedUser;
    }

    const uid = deriveUidFromEmail(email);
    const newUser: AuthenticatedUser = {
      uid,
      googleUid: `google_${email}`,
      displayName: inferDisplayNameFromEmail(email),
      email,
      idToken: `mock_email_token_${uid}_${Date.now()}`,
      provider: 'email',
      lastLoginAt: now,
    };

    writeDb({
      ...db,
      users: {
        ...db.users,
        [uid]: newUser,
      },
    });
    writeSessionUserId(uid);
    return newUser;
  },

  async signOut(): Promise<void> {
    writeSessionUserId(null);
  },
};
