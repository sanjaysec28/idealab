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
  getSignupDraft,
  registerStudentAccount,
  reloadStudentUser,
  resendStudentVerificationEmail,
  sendStudentPasswordReset,
  signInStudentAccount,
  signOutStudentAccount,
} from '../firebase/authService';
import {
  getStudentProfile,
  subscribeToStudentProfile,
} from '../firebase/studentService';
import {
  getStudentAvailability,
  getStudentTimetable,
  subscribeToStudentAvailability,
  subscribeToStudentTimetable,
} from '../services/timetableService';
import { AuthStateStatus, SignInInput, SignupInput, StudentProfileDoc } from '../types/auth';
import { StudentAvailabilityDoc, StudentTimetableDoc } from '../types/timetable';
import {
  deriveAuthState,
  hasSubmittedStudentTimetable,
  resolveDestinationForState,
} from '../utils/authRouting';

export interface DerivedStudentData {
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  year: string;
  semester: string;
  submittedDate?: string;
}

interface AuthContextType {
  user: User | null;
  studentProfile: StudentProfileDoc | null;
  studentTimetable: StudentTimetableDoc | null;
  studentAvailability: StudentAvailabilityDoc | null;
  hasCompletedTimetable: boolean;
  authState: AuthStateStatus;
  isAuthReady: boolean;
  isBusy: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signup: (input: SignupInput) => Promise<User>;
  signIn: (input: SignInInput) => Promise<AuthStateStatus>;
  resendVerificationEmail: () => Promise<void>;
  refreshVerificationStatus: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<void>;
  refreshStudentData: () => Promise<void>;
  signOut: () => Promise<void>;
  resolveDestinationPath: (intendedPath?: string, overrideState?: AuthStateStatus) => string;
  studentData: DerivedStudentData;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfileDoc | null>(null);
  const [studentTimetable, setStudentTimetable] = useState<StudentTimetableDoc | null>(null);
  const [studentAvailability, setStudentAvailability] = useState<StudentAvailabilityDoc | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState<boolean>(false);
  const [isTimetableLoaded, setIsTimetableLoaded] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeTimetable: (() => void) | null = null;
    let unsubscribeAvailability: (() => void) | null = null;
    let active = true;

    const cleanupListeners = () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }
      if (unsubscribeTimetable) {
        unsubscribeTimetable();
        unsubscribeTimetable = null;
      }
      if (unsubscribeAvailability) {
        unsubscribeAvailability();
        unsubscribeAvailability = null;
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!active) return;

      cleanupListeners();

      if (!firebaseUser) {
        setUser(null);
        setEmailVerified(false);
        setIsAuthReady(true);
        setStudentProfile(null);
        setStudentTimetable(null);
        setStudentAvailability(null);
        setIsProfileLoaded(true);
        setIsTimetableLoaded(true);
        return;
      }

      setIsProfileLoaded(false);
      setIsTimetableLoaded(false);

      void (async () => {
        let resolvedUser = firebaseUser;

        if (!resolvedUser.emailVerified) {
          try {
            resolvedUser = await reloadStudentUser(resolvedUser);
          } catch {
            // Keep existing Firebase user object if reload fails transiently
          }
        }

        if (!active || auth.currentUser?.uid !== resolvedUser.uid) return;

        setUser(resolvedUser);
        setEmailVerified(Boolean(resolvedUser.emailVerified));
        setIsAuthReady(true);

        if (!resolvedUser.emailVerified) {
          setStudentProfile(null);
          setStudentTimetable(null);
          setStudentAvailability(null);
          setIsProfileLoaded(true);
          setIsTimetableLoaded(true);
          return;
        }

        try {
          const tokenResult = await resolvedUser.getIdTokenResult();
          if (!tokenResult.claims.email_verified) {
            await resolvedUser.getIdToken(true);
          }
        } catch {
          // Continue subscribing even if token refresh fails transiently
        }

        if (!active || auth.currentUser?.uid !== resolvedUser.uid) return;

        unsubscribeProfile = subscribeToStudentProfile(
          resolvedUser.uid,
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

        unsubscribeTimetable = subscribeToStudentTimetable(
          resolvedUser.uid,
          (timetableDoc) => {
            if (!active) return;
            setStudentTimetable(timetableDoc);
            setIsTimetableLoaded(true);
          },
          (err) => {
            if (!active) return;
            setAuthError(err.message);
            setIsTimetableLoaded(true);
          }
        );

        unsubscribeAvailability = subscribeToStudentAvailability(
          resolvedUser.uid,
          (availabilityDoc) => {
            if (!active) return;
            setStudentAvailability(availabilityDoc);
          }
        );
      })();
    });

    return () => {
      active = false;
      unsubscribeAuth();
      cleanupListeners();
    };
  }, []);

  const isStudentDataLoaded = isProfileLoaded && isTimetableLoaded;

  const authState = useMemo(
    () =>
      deriveAuthState({
        isAuthReady,
        hasUser: Boolean(user),
        emailVerified,
        isStudentDataLoaded,
        profile: studentProfile,
        timetable: studentTimetable,
      }),
    [isAuthReady, user, emailVerified, isStudentDataLoaded, studentProfile, studentTimetable]
  );

  const hasCompletedTimetable = useMemo(
    () => hasSubmittedStudentTimetable(studentProfile, studentTimetable),
    [studentProfile, studentTimetable]
  );

  const resolveDestinationPath = useCallback(
    (intendedPath?: string, overrideState?: AuthStateStatus): string => {
      const targetState = overrideState ?? authState;
      return resolveDestinationForState(targetState, intendedPath);
    },
    [authState]
  );

  const loadStudentDocs = useCallback(async (uid: string) => {
    const [profileDoc, timetableDoc, availabilityDoc] = await Promise.all([
      getStudentProfile(uid),
      getStudentTimetable(uid),
      getStudentAvailability(uid),
    ]);
    setStudentProfile(profileDoc);
    setStudentTimetable(timetableDoc);
    setStudentAvailability(availabilityDoc);
    setIsProfileLoaded(true);
    setIsTimetableLoaded(true);
    return { profileDoc, timetableDoc, availabilityDoc };
  }, []);

  const resolveStateForUser = useCallback(
    async (firebaseUser: User): Promise<AuthStateStatus> => {
      const freshUser = await reloadStudentUser(firebaseUser);
      setUser(freshUser);
      setEmailVerified(freshUser.emailVerified);
      setIsAuthReady(true);

      if (!freshUser.emailVerified) {
        setStudentProfile(null);
        setStudentTimetable(null);
        setStudentAvailability(null);
        setIsProfileLoaded(true);
        setIsTimetableLoaded(true);
        return 'unverified_email';
      }

      const { profileDoc, timetableDoc } = await loadStudentDocs(freshUser.uid);
      return hasSubmittedStudentTimetable(profileDoc, timetableDoc)
        ? 'ready'
        : 'needs_timetable';
    },
    [loadStudentDocs]
  );

  const signup = useCallback(async (input: SignupInput): Promise<User> => {
    setAuthError(null);
    setIsBusy(true);
    try {
      const createdUser = await registerStudentAccount(input);
      setUser(createdUser);
      setEmailVerified(createdUser.emailVerified);
      setIsAuthReady(true);
      setStudentProfile(null);
      setStudentTimetable(null);
      setStudentAvailability(null);
      setIsProfileLoaded(true);
      setIsTimetableLoaded(true);
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
    setIsAuthReady(true);
    if (reloaded.emailVerified) {
      try {
        await loadStudentDocs(reloaded.uid);
      } catch {
        setIsProfileLoaded(true);
        setIsTimetableLoaded(true);
      }
    }
    return reloaded.emailVerified;
  }, [user, loadStudentDocs]);

  const refreshStudentData = useCallback(async (): Promise<void> => {
    const targetUser = auth.currentUser || user;
    if (!targetUser || !targetUser.emailVerified) return;
    await loadStudentDocs(targetUser.uid);
  }, [user, loadStudentDocs]);

  const sendPasswordReset = useCallback(async (email: string): Promise<void> => {
    setAuthError(null);
    await sendStudentPasswordReset(email);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await signOutStudentAccount();
    setUser(null);
    setEmailVerified(false);
    setStudentProfile(null);
    setStudentTimetable(null);
    setStudentAvailability(null);
    setIsProfileLoaded(true);
    setIsTimetableLoaded(true);
    setAuthError(null);
  }, []);

  const studentData: DerivedStudentData = useMemo(() => {
    const draft = user ? getSignupDraft(user.uid) : null;
    const emailPrefix = user?.email ? user.email.split('@')[0] : '';
    return {
      name:
        studentProfile?.fullName ||
        user?.displayName ||
        draft?.fullName ||
        emailPrefix ||
        'IDEA Lab Student',
      email: studentProfile?.email || user?.email || '',
      rollNumber: studentProfile?.registrationNumber || draft?.registrationNumber || '',
      department:
        studentProfile?.department ||
        studentTimetable?.department ||
        'AI & Data Science',
      year:
        studentProfile?.currentAcademicYear ||
        studentProfile?.academicYear ||
        studentTimetable?.academicYear ||
        '3rd Year',
      semester:
        studentProfile?.currentSemester ||
        studentTimetable?.semester ||
        'Semester 5',
      submittedDate: studentProfile?.createdAt?.toDate
        ? studentProfile.createdAt.toDate().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : undefined,
    };
  }, [studentProfile, studentTimetable, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        studentTimetable,
        studentAvailability,
        hasCompletedTimetable,
        authState,
        isAuthReady,
        isBusy,
        authError,
        clearAuthError,
        signup,
        signIn,
        resendVerificationEmail,
        refreshVerificationStatus,
        sendPasswordReset,
        refreshStudentData,
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
