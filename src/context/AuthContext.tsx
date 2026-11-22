import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, authPersistenceReady } from '../firebase/config';
import {
  checkIsAdminUser,
  reloadStudentUser,
  signInWithGoogle as firebaseSignInWithGoogle,
  signOutStudentAccount,
  verifyActiveStudentSession,
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
import { AuthStateStatus, StudentProfileDoc } from '../types/auth';
import { StudentAvailabilityDoc, StudentTimetableDoc } from '../types/timetable';
import {
  deriveAuthState,
  hasFinalizedStudentTimetable,
  isStudentProfileComplete,
  resolveDestinationForState,
} from '../utils/authRouting';

const SESSION_SYNC_CHANNEL = 'idealab_auth_sync';

type SessionSyncMessage =
  | { type: 'SIGNED_OUT' }
  | { type: 'SIGNED_IN'; uid: string };

export interface DerivedStudentData {
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  degree: string;
  year: string;
  semester: string;
  submittedDate?: string;
}

interface AuthContextType {
  user: User | null;
  studentProfile: StudentProfileDoc | null;
  studentTimetable: StudentTimetableDoc | null;
  studentAvailability: StudentAvailabilityDoc | null;
  isAdmin: boolean;
  isAdminChecked: boolean;
  hasCompletedProfile: boolean;
  hasCompletedTimetable: boolean;
  isTimetableLocked: boolean;
  authState: AuthStateStatus;
  isAuthReady: boolean;
  isBusy: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<AuthStateStatus>;
  refreshStudentData: () => Promise<void>;
  signOut: () => Promise<void>;
  resolveDestinationPath: (intendedPath?: string, overrideState?: AuthStateStatus) => string;
  studentData: DerivedStudentData;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfileDoc | null>(null);
  const [studentTimetable, setStudentTimetable] = useState<StudentTimetableDoc | null>(null);
  const [studentAvailability, setStudentAvailability] = useState<StudentAvailabilityDoc | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminChecked, setIsAdminChecked] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState<boolean>(false);
  const [isTimetableLoaded, setIsTimetableLoaded] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const activeSessionUidRef = useRef<string | null>(null);
  const sessionEpochRef = useRef<number>(0);
  const inFlightLoadRef = useRef<{
    uid: string;
    promise: Promise<{
      profileDoc: StudentProfileDoc | null;
      timetableDoc: StudentTimetableDoc | null;
      availabilityDoc: StudentAvailabilityDoc | null;
    }>;
  } | null>(null);
  const syncChannelRef = useRef<BroadcastChannel | null>(null);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const resetToSignedOutState = useCallback((errorMessage: string | null = null) => {
    activeSessionUidRef.current = null;
    inFlightLoadRef.current = null;
    setUser(null);
    setIsAdmin(false);
    setIsAdminChecked(true);
    setIsAuthReady(true);
    setStudentProfile(null);
    setStudentTimetable(null);
    setStudentAvailability(null);
    setIsProfileLoaded(true);
    setIsTimetableLoaded(true);
    setAuthError(errorMessage);
  }, []);

  const postSessionSync = useCallback((message: SessionSyncMessage) => {
    try {
      syncChannelRef.current?.postMessage(message);
    } catch {
      // Ignore BroadcastChannel errors
    }
  }, []);

  // Multi-tab instant session synchronization via BroadcastChannel (no tokens stored)
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(SESSION_SYNC_CHANNEL);
    syncChannelRef.current = channel;

    channel.onmessage = (event: MessageEvent<SessionSyncMessage>) => {
      const payload = event.data;
      if (!payload) return;

      if (payload.type === 'SIGNED_OUT') {
        if (activeSessionUidRef.current !== null || auth.currentUser) {
          sessionEpochRef.current += 1;
          void signOutStudentAccount().catch(() => undefined);
          resetToSignedOutState(null);
        }
      } else if (payload.type === 'SIGNED_IN') {
        if (auth.currentUser && activeSessionUidRef.current !== auth.currentUser.uid) {
          void verifyActiveStudentSession(auth.currentUser);
        }
      }
    };

    return () => {
      syncChannelRef.current = null;
      channel.close();
    };
  }, [resetToSignedOutState]);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | null = null;
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

    void authPersistenceReady.then(() => {
      if (!active) return;

      unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
        if (!active) return;

        if (!firebaseUser) {
          cleanupListeners();
          sessionEpochRef.current += 1;
          resetToSignedOutState(null);
          return;
        }

        // Prevent duplicate listener setup and profile reads if the exact same session is already active
        if (activeSessionUidRef.current === firebaseUser.uid) {
          setUser(firebaseUser);
          setIsAuthReady(true);
          return;
        }

        cleanupListeners();
        activeSessionUidRef.current = firebaseUser.uid;
        const epoch = ++sessionEpochRef.current;

        setIsProfileLoaded(false);
        setIsTimetableLoaded(false);
        setIsAdminChecked(false);
        setAuthError(null);

        void (async () => {
          const verification = await verifyActiveStudentSession(firebaseUser);
          if (!active || sessionEpochRef.current !== epoch) return;

          if (verification.valid === false) {
            cleanupListeners();
            await signOutStudentAccount().catch(() => undefined);
            if (!active || sessionEpochRef.current !== epoch) return;
            resetToSignedOutState(verification.reason);
            return;
          }

          const resolvedUser = verification.user;
          setUser(resolvedUser);
          setIsAuthReady(true);

          void checkIsAdminUser(resolvedUser).then((adminFlag) => {
            if (active && sessionEpochRef.current === epoch) {
              setIsAdmin(adminFlag);
              setIsAdminChecked(true);
            }
          });

          let profileReceived = false;
          let timetableReceived = false;

          unsubscribeProfile = subscribeToStudentProfile(
            resolvedUser.uid,
            (profileDoc) => {
              if (!active || sessionEpochRef.current !== epoch) return;
              profileReceived = true;
              setStudentProfile(profileDoc);
              setIsProfileLoaded(true);
            },
            (err) => {
              if (!active || sessionEpochRef.current !== epoch) return;
              if (!profileReceived) {
                setAuthError(err.message);
                setIsProfileLoaded(true);
              }
            }
          );

          unsubscribeTimetable = subscribeToStudentTimetable(
            resolvedUser.uid,
            (timetableDoc) => {
              if (!active || sessionEpochRef.current !== epoch) return;
              timetableReceived = true;
              setStudentTimetable(timetableDoc);
              setIsTimetableLoaded(true);
            },
            (err) => {
              if (!active || sessionEpochRef.current !== epoch) return;
              if (!timetableReceived) {
                setAuthError(err.message);
                setIsTimetableLoaded(true);
              }
            }
          );

          unsubscribeAvailability = subscribeToStudentAvailability(
            resolvedUser.uid,
            (availabilityDoc) => {
              if (!active || sessionEpochRef.current !== epoch) return;
              setStudentAvailability(availabilityDoc);
            }
          );
        })();
      });
    });

    return () => {
      active = false;
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
      cleanupListeners();
    };
  }, [resetToSignedOutState]);

  // Re-validate session on tab focus / next-day return to catch revoked or disabled accounts safely
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState && document.visibilityState !== 'visible') return;
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const epochAtCheck = sessionEpochRef.current;
      void verifyActiveStudentSession(currentUser).then(async (result) => {
        if (sessionEpochRef.current !== epochAtCheck) return;
        if (result.valid === false) {
          sessionEpochRef.current += 1;
          await signOutStudentAccount().catch(() => undefined);
          resetToSignedOutState(result.reason);
          postSessionSync({ type: 'SIGNED_OUT' });
        } else {
          const adminFlag = await checkIsAdminUser(result.user);
          if (sessionEpochRef.current === epochAtCheck) {
            setIsAdmin(adminFlag);
            setIsAdminChecked(true);
          }
        }
      });
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [postSessionSync, resetToSignedOutState]);

  const isStudentDataLoaded = isProfileLoaded && isTimetableLoaded;

  const authState = useMemo(
    () =>
      deriveAuthState({
        isAuthReady,
        hasUser: Boolean(user),
        isStudentDataLoaded,
        profile: studentProfile,
        timetable: studentTimetable,
      }),
    [isAuthReady, user, isStudentDataLoaded, studentProfile, studentTimetable]
  );

  const hasCompletedProfile = useMemo(
    () => isStudentProfileComplete(studentProfile),
    [studentProfile]
  );

  const hasCompletedTimetable = useMemo(
    () => hasFinalizedStudentTimetable(studentProfile, studentTimetable),
    [studentProfile, studentTimetable]
  );

  const isTimetableLocked = hasCompletedTimetable;

  const resolveDestinationPath = useCallback(
    (intendedPath?: string, overrideState?: AuthStateStatus): string => {
      const targetState = overrideState ?? authState;
      return resolveDestinationForState(targetState, intendedPath);
    },
    [authState]
  );

  const loadStudentDocs = useCallback(async (uid: string) => {
    if (inFlightLoadRef.current?.uid === uid) {
      return inFlightLoadRef.current.promise;
    }

    const promise = (async () => {
      const [profileDoc, timetableDoc, availabilityDoc] = await Promise.all([
        getStudentProfile(uid),
        getStudentTimetable(uid),
        getStudentAvailability(uid),
      ]);
      if (auth.currentUser?.uid === uid) {
        setStudentProfile(profileDoc);
        setStudentTimetable(timetableDoc);
        setStudentAvailability(availabilityDoc);
        setIsProfileLoaded(true);
        setIsTimetableLoaded(true);
      }
      return { profileDoc, timetableDoc, availabilityDoc };
    })().finally(() => {
      if (inFlightLoadRef.current?.uid === uid) {
        inFlightLoadRef.current = null;
      }
    });

    inFlightLoadRef.current = { uid, promise };
    return promise;
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthStateStatus> => {
    setAuthError(null);
    setIsBusy(true);
    try {
      const signedInUser = await firebaseSignInWithGoogle();
      const freshUser = await reloadStudentUser(signedInUser);
      setUser(freshUser);
      setIsAuthReady(true);

      const [adminFlag, docs] = await Promise.all([
        checkIsAdminUser(freshUser),
        loadStudentDocs(freshUser.uid),
      ]);
      setIsAdmin(adminFlag);
      setIsAdminChecked(true);
      postSessionSync({ type: 'SIGNED_IN', uid: freshUser.uid });

      return deriveAuthState({
        isAuthReady: true,
        hasUser: true,
        isStudentDataLoaded: true,
        profile: docs.profileDoc,
        timetable: docs.timetableDoc,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setAuthError(msg);
      throw err;
    } finally {
      setIsBusy(false);
    }
  }, [loadStudentDocs, postSessionSync]);

  const refreshStudentData = useCallback(async (): Promise<void> => {
    const targetUser = auth.currentUser || user;
    if (!targetUser) return;
    await loadStudentDocs(targetUser.uid);
  }, [user, loadStudentDocs]);

  const signOut = useCallback(async (): Promise<void> => {
    sessionEpochRef.current += 1;
    await signOutStudentAccount();
    resetToSignedOutState(null);
    postSessionSync({ type: 'SIGNED_OUT' });
  }, [postSessionSync, resetToSignedOutState]);

  const studentData: DerivedStudentData = useMemo(() => {
    const emailPrefix = user?.email ? user.email.split('@')[0] : '';
    return {
      name:
        studentProfile?.fullName ||
        user?.displayName ||
        emailPrefix ||
        'IDEA Lab Student',
      email: studentProfile?.email || user?.email || '',
      rollNumber: studentProfile?.registrationNumber || '',
      department:
        studentProfile?.department ||
        studentTimetable?.department ||
        'AI & Data Science',
      degree: studentProfile?.degree || '',
      year:
        studentProfile?.currentAcademicYear ||
        studentProfile?.academicYear ||
        studentTimetable?.academicYear ||
        '',
      semester:
        studentProfile?.currentSemester ||
        studentTimetable?.semester ||
        '',
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
        isAdmin,
        isAdminChecked,
        hasCompletedProfile,
        hasCompletedTimetable,
        isTimetableLocked,
        authState,
        isAuthReady,
        isBusy,
        authError,
        clearAuthError,
        signInWithGoogle,
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
