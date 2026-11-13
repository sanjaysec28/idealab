import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase/config';
import {
  registerStudentAccount,
  reloadStudentUser,
  resendStudentVerificationEmail,
  sendStudentPasswordReset,
  signInStudentAccount,
  signInStudentWithGoogle,
  signOutStudentAccount,
} from '../firebase/authService';
import {
  getStudentProfile,
  submitStudentMembershipRequest,
  subscribeToStudentProfile,
} from '../firebase/studentService';
import {
  AuthStateStatus,
  MembershipRequestInput,
  SignInInput,
  SignupInput,
  StudentProfileDoc,
} from '../types/auth';

export interface DerivedStudentData {
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  year: string;
  submittedDate?: string;
}

interface AuthContextType {
  user: User | null;
  studentProfile: StudentProfileDoc | null;
  authState: AuthStateStatus;
  isAuthReady: boolean;
  isBusy: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signup: (input: SignupInput) => Promise<User>;
  signIn: (input: SignInInput) => Promise<AuthStateStatus>;
  signInWithGoogle: () => Promise<AuthStateStatus>;
  resendVerificationEmail: () => Promise<void>;
  refreshVerificationStatus: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<void>;
  submitMembershipRequest: (input: MembershipRequestInput) => Promise<StudentProfileDoc>;
  refreshMembership: () => Promise<StudentProfileDoc | null>;
  signOut: () => Promise<void>;
  resolveDestinationPath: (intendedPath?: string, overrideState?: AuthStateStatus) => string;
  studentData: DerivedStudentData;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_OR_STATUS_PATHS = new Set([
  '/',
  '/splash',
  '/welcome',
  '/onboarding',
  '/signup',
  '/login',
  '/join',
  '/verify-email',
  '/membership-request',
  '/pending-approval',
  '/membership-rejected',
  '/application-rejected',
  '/account-suspended',
]);

function deriveAuthState(
  isAuthReady: boolean,
  user: User | null,
  emailVerified: boolean,
  isProfileLoaded: boolean,
  profile: StudentProfileDoc | null
): AuthStateStatus {
  if (!isAuthReady) return 'loading';
  if (!user) return 'unauthenticated';
  if (!emailVerified) return 'unverified_email';
  if (!isProfileLoaded) return 'loading';
  if (!profile) return 'needs_membership_request';

  switch (profile.membershipStatus) {
    case 'approved':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'pending':
    default:
      return 'pending';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfileDoc | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let active = true;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!active) return;

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!firebaseUser) {
        setUser(null);
        setEmailVerified(false);
        setIsAuthReady(true);
        setStudentProfile(null);
        setIsProfileLoaded(true);
        return;
      }

      setUser(firebaseUser);
      setEmailVerified(Boolean(firebaseUser.emailVerified));
      setIsAuthReady(true);

      setIsProfileLoaded(false);
      void (async () => {
        if (firebaseUser.emailVerified) {
          try {
            const tokenResult = await firebaseUser.getIdTokenResult();
            if (!tokenResult.claims.email_verified) {
              await firebaseUser.getIdToken(true);
            }
          } catch {
            // Continue subscribing even if token refresh fails transiently
          }
        }
        if (!active || auth.currentUser?.uid !== firebaseUser.uid) return;
        unsubscribeProfile = subscribeToStudentProfile(
          firebaseUser.uid,
          (profileDoc) => {
            if (!active) return;
            setStudentProfile(profileDoc);
            setIsProfileLoaded(true);
          },
          (err) => {
            if (!active) return;
            setAuthError(err.message);
            setIsProfileLoaded(true);
          }
        );
      })();
    });

    return () => {
      active = false;
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const resolveDestinationPath = useCallback(
    (intendedPath?: string, overrideState?: AuthStateStatus): string => {
      const targetState =
        overrideState ??
        deriveAuthState(isAuthReady, user, emailVerified, isProfileLoaded, studentProfile);

      switch (targetState) {
        case 'unauthenticated':
          return '/welcome';
        case 'unverified_email':
          return '/verify-email';
        case 'needs_membership_request':
          return '/membership-request';
        case 'pending':
          return '/pending-approval';
        case 'rejected':
          return '/membership-rejected';
        case 'approved': {
          if (intendedPath && !PUBLIC_OR_STATUS_PATHS.has(intendedPath.split('?')[0])) {
            return intendedPath;
          }
          return '/discover';
        }
        case 'loading':
        default:
          return '/welcome';
      }
    },
    [isAuthReady, user, emailVerified, isProfileLoaded, studentProfile]
  );

  const resolveStateForUser = useCallback(async (firebaseUser: User): Promise<AuthStateStatus> => {
    await firebaseUser.reload();
    const freshUser = auth.currentUser || firebaseUser;
    setUser(freshUser);
    setEmailVerified(freshUser.emailVerified);

    if (!freshUser.emailVerified) {
      setStudentProfile(null);
      setIsProfileLoaded(true);
      return 'unverified_email';
    }

    const tokenResult = await freshUser.getIdTokenResult();
    if (!tokenResult.claims.email_verified) {
      await freshUser.getIdToken(true);
    }

    const profileDoc = await getStudentProfile(freshUser.uid);
    setStudentProfile(profileDoc);
    setIsProfileLoaded(true);

    if (!profileDoc) {
      return 'needs_membership_request';
    }
    return profileDoc.membershipStatus;
  }, []);

  const signup = useCallback(async (input: SignupInput): Promise<User> => {
    setAuthError(null);
    setIsBusy(true);
    try {
      const createdUser = await registerStudentAccount(input);
      setUser(createdUser);
      setEmailVerified(createdUser.emailVerified);
      setStudentProfile(null);
      setIsProfileLoaded(true);
      return createdUser;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed.';
      setAuthError(msg);
      throw err;
    } finally {
      setIsBusy(false);
    }
  }, []);

  const signIn = useCallback(
    async (input: SignInInput): Promise<AuthStateStatus> => {
      setAuthError(null);
      setIsBusy(true);
      try {
        const loggedInUser = await signInStudentAccount(input);
        return await resolveStateForUser(loggedInUser);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Sign in failed.';
        setAuthError(msg);
        throw err;
      } finally {
        setIsBusy(false);
      }
    },
    [resolveStateForUser]
  );

  const signInWithGoogle = useCallback(async (): Promise<AuthStateStatus> => {
    setAuthError(null);
    setIsBusy(true);
    try {
      const googleUser = await signInStudentWithGoogle();
      return await resolveStateForUser(googleUser);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setAuthError(msg);
      throw err;
    } finally {
      setIsBusy(false);
    }
  }, [resolveStateForUser]);

  const resendVerificationEmail = useCallback(async (): Promise<void> => {
    const targetUser = auth.currentUser || user;
    if (!targetUser) {
      throw new Error('No active user session found.');
    }
    setAuthError(null);
    await resendStudentVerificationEmail(targetUser);
  }, [user]);

  const refreshVerificationStatus = useCallback(async (): Promise<boolean> => {
    const targetUser = auth.currentUser || user;
    if (!targetUser) return false;
    setAuthError(null);
    const reloaded = await reloadStudentUser(targetUser);
    setUser(reloaded);
    setEmailVerified(reloaded.emailVerified);
    if (reloaded.emailVerified) {
      const profileDoc = await getStudentProfile(reloaded.uid);
      setStudentProfile(profileDoc);
      setIsProfileLoaded(true);
    }
    return reloaded.emailVerified;
  }, [user]);

  const sendPasswordReset = useCallback(async (email: string): Promise<void> => {
    setAuthError(null);
    await sendStudentPasswordReset(email);
  }, []);

  const submitMembershipRequest = useCallback(
    async (input: MembershipRequestInput): Promise<StudentProfileDoc> => {
      setAuthError(null);
      setIsBusy(true);
      try {
        const created = await submitStudentMembershipRequest(input);
        setStudentProfile(created);
        setIsProfileLoaded(true);
        return created;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unable to submit membership request.';
        setAuthError(msg);
        throw err;
      } finally {
        setIsBusy(false);
      }
    },
    []
  );

  const refreshMembership = useCallback(async (): Promise<StudentProfileDoc | null> => {
    const targetUser = auth.currentUser || user;
    if (!targetUser) return null;
    try {
      const latest = await getStudentProfile(targetUser.uid);
      setStudentProfile(latest);
      setIsProfileLoaded(true);
      return latest;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to refresh membership status.');
      return null;
    }
  }, [user]);

  const signOut = useCallback(async (): Promise<void> => {
    await signOutStudentAccount();
    setUser(null);
    setEmailVerified(false);
    setStudentProfile(null);
    setIsProfileLoaded(true);
    setAuthError(null);
  }, []);

  const authState = useMemo(
    () => deriveAuthState(isAuthReady, user, emailVerified, isProfileLoaded, studentProfile),
    [isAuthReady, user, emailVerified, isProfileLoaded, studentProfile]
  );

  const studentData: DerivedStudentData = useMemo(
    () => ({
      name: studentProfile?.fullName || user?.displayName || 'IDEA Lab Student',
      email: studentProfile?.email || user?.email || '',
      rollNumber: studentProfile?.registrationNumber || '',
      department: studentProfile?.department || 'AI & Data Science',
      year: studentProfile?.academicYear || '3rd Year',
      submittedDate: studentProfile?.createdAt?.toDate
        ? studentProfile.createdAt.toDate().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : undefined,
    }),
    [studentProfile, user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        authState,
        isAuthReady,
        isBusy,
        authError,
        clearAuthError,
        signup,
        signIn,
        signInWithGoogle,
        resendVerificationEmail,
        refreshVerificationStatus,
        sendPasswordReset,
        submitMembershipRequest,
        refreshMembership,
        signOut,
        resolveDestinationPath,
        studentData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
