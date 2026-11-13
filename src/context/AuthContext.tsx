import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AuthenticatedUser,
  AuthStateStatus,
  EmailSignInCredentials,
  GoogleSignInOptions,
  JoinRequestInput,
  MembershipStatus,
} from '../types/auth';
import {
  NotificationRecord,
  StudentMembership,
  StudentProfile,
  VerificationSyncResult,
} from '../types/membership';
import { authService } from '../auth/authService';
import { membershipService } from '../auth/membershipService';
import { notificationService } from '../services/notifications/notificationService';

export type StudentStatus = 'approved' | 'pending' | 'new' | 'logged_out' | 'rejected' | 'suspended';

export interface LegacyStudentData {
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  year: string;
  requestId?: string;
  submittedDate?: string;
}

interface AuthContextType {
  user: AuthenticatedUser | null;
  membership: StudentMembership | null;
  profile: StudentProfile | null;
  authState: AuthStateStatus;
  isAuthLoading: boolean;
  isMembershipLoading: boolean;
  academicProfileCompleted: boolean;
  timetableCompleted: boolean;
  notificationRecord: NotificationRecord | null;
  authError: string | null;
  clearAuthError: () => void;

  // Phase 2 Auth & Membership Actions
  signInWithGoogle: (options?: GoogleSignInOptions) => Promise<VerificationSyncResult>;
  signInWithEmail: (credentials: EmailSignInCredentials) => Promise<VerificationSyncResult>;
  submitJoinRequest: (data: JoinRequestInput) => Promise<VerificationSyncResult>;
  signOut: () => Promise<void>;
  refreshMembership: () => Promise<StudentMembership | null>;
  retryCoordinatorNotification: (options?: { simulateFailure?: boolean }) => Promise<NotificationRecord | null>;
  completeAcademicProfile: (data: {
    fullName: string;
    rollNumber: string;
    department: string;
    year: string;
    semester: string;
    section: string;
    session: string;
  }) => Promise<StudentProfile>;
  completeTimetableSetup: (slotsCount?: number) => Promise<StudentProfile>;
  attemptStudentStatusMutation: (targetStatus: MembershipStatus) => Promise<never>;
  resolveDestinationPath: (
    intendedPath?: string,
    overrideMembership?: StudentMembership | null,
    overrideProfile?: StudentProfile | null
  ) => string;

  // Derived compatibility helpers for existing UI components
  status: StudentStatus;
  studentData: LegacyStudentData;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapMembershipToAuthState(
  user: AuthenticatedUser | null,
  membership: StudentMembership | null
): AuthStateStatus {
  if (!user) return 'unauthenticated';
  if (!membership) return 'pending';
  switch (membership.status) {
    case MembershipStatus.APPROVED:
      return 'approved';
    case MembershipStatus.REJECTED:
      return 'rejected';
    case MembershipStatus.SUSPENDED:
      return 'suspended';
    case MembershipStatus.PENDING:
    default:
      return 'pending';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [membership, setMembership] = useState<StudentMembership | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [notificationRecord, setNotificationRecord] = useState<NotificationRecord | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isMembershipLoading, setIsMembershipLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const syncUserMembership = useCallback(
    async (
      authedUser: AuthenticatedUser,
      options?: {
        joinDetails?: Partial<JoinRequestInput>;
        simulateNotificationFailure?: boolean;
      }
    ): Promise<VerificationSyncResult> => {
      setIsMembershipLoading(true);
      try {
        const result = await membershipService.verifyAndSyncMembership(authedUser, options);
        setMembership(result.membership);
        setProfile(result.profile);
        setNotificationRecord(
          result.notification || notificationService.getByRequestId(result.membership.requestId)
        );
        return result;
      } finally {
        setIsMembershipLoading(false);
      }
    },
    []
  );

  // Hydrate active session on mount
  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      setIsAuthLoading(true);
      try {
        const currentUser = await authService.getCurrentUser();
        if (!active) return;

        if (!currentUser) {
          setUser(null);
          setMembership(null);
          setProfile(null);
          setNotificationRecord(null);
          return;
        }

        setUser(currentUser);
        setIsMembershipLoading(true);
        const [existingMembership, existingProfile] = await Promise.all([
          membershipService.getMembershipByUserId(currentUser.uid),
          membershipService.getProfileByUserId(currentUser.uid),
        ]);
        if (!active) return;

        if (existingMembership) {
          setMembership(existingMembership);
          setProfile(existingProfile);
          setNotificationRecord(notificationService.getByRequestId(existingMembership.requestId));
        } else {
          const synced = await membershipService.verifyAndSyncMembership(currentUser);
          if (!active) return;
          setMembership(synced.membership);
          setProfile(synced.profile);
          setNotificationRecord(synced.notification);
        }
      } catch (err) {
        if (active) {
          setAuthError(err instanceof Error ? err.message : 'Unable to restore session.');
        }
      } finally {
        if (active) {
          setIsAuthLoading(false);
          setIsMembershipLoading(false);
        }
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  // Realtime subscription to membership changes (automatically detects coordinator approval/rejection/suspension)
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = membershipService.subscribeToMembership(
      user.uid,
      ({ membership: updatedMembership, profile: updatedProfile }) => {
        setMembership(updatedMembership);
        if (updatedProfile) {
          setProfile(updatedProfile);
        }
        if (updatedMembership) {
          setNotificationRecord(notificationService.getByRequestId(updatedMembership.requestId));
        }
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const refreshMembership = useCallback(async (): Promise<StudentMembership | null> => {
    if (!user?.uid) return null;
    setIsMembershipLoading(true);
    try {
      const [latestMembership, latestProfile] = await Promise.all([
        membershipService.getMembershipByUserId(user.uid),
        membershipService.getProfileByUserId(user.uid),
      ]);
      setMembership(latestMembership);
      setProfile(latestProfile);
      if (latestMembership) {
        setNotificationRecord(notificationService.getByRequestId(latestMembership.requestId));
      }
      return latestMembership;
    } finally {
      setIsMembershipLoading(false);
    }
  }, [user?.uid]);

  // Periodic background poll while PENDING so external backend changes propagate cleanly
  useEffect(() => {
    if (!user?.uid || membership?.status !== MembershipStatus.PENDING) return;
    const intervalId = window.setInterval(() => {
      void refreshMembership();
    }, 4000);
    return () => window.clearInterval(intervalId);
  }, [user?.uid, membership?.status, refreshMembership]);

  const signInWithGoogle = useCallback(
    async (options?: GoogleSignInOptions): Promise<VerificationSyncResult> => {
      setAuthError(null);
      setIsAuthLoading(true);
      try {
        const authedUser = await authService.signInWithGoogle(options);
        setUser(authedUser);
        return await syncUserMembership(authedUser, {
          simulateNotificationFailure: options?.simulateNotificationFailure,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Google Sign-In failed.';
        setAuthError(message);
        throw err;
      } finally {
        setIsAuthLoading(false);
      }
    },
    [syncUserMembership]
  );

  const signInWithEmail = useCallback(
    async (credentials: EmailSignInCredentials): Promise<VerificationSyncResult> => {
      setAuthError(null);
      setIsAuthLoading(true);
      try {
        const authedUser = await authService.signInWithEmail(credentials);
        setUser(authedUser);
        return await syncUserMembership(authedUser);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Email Sign-In failed.';
        setAuthError(message);
        throw err;
      } finally {
        setIsAuthLoading(false);
      }
    },
    [syncUserMembership]
  );

  const submitJoinRequest = useCallback(
    async (data: JoinRequestInput): Promise<VerificationSyncResult> => {
      setAuthError(null);
      setIsAuthLoading(true);
      try {
        const authedUser = await authService.signInWithGoogle({
          email: data.email,
          displayName: data.name,
          simulateNotificationFailure: data.simulateNotificationFailure,
        });
        setUser(authedUser);
        return await syncUserMembership(authedUser, {
          joinDetails: data,
          simulateNotificationFailure: data.simulateNotificationFailure,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to submit membership request.';
        setAuthError(message);
        throw err;
      } finally {
        setIsAuthLoading(false);
      }
    },
    [syncUserMembership]
  );

  const signOut = useCallback(async (): Promise<void> => {
    await authService.signOut();
    setUser(null);
    setMembership(null);
    setProfile(null);
    setNotificationRecord(null);
    setAuthError(null);
  }, []);

  const retryCoordinatorNotification = useCallback(
    async (options?: { simulateFailure?: boolean }): Promise<NotificationRecord | null> => {
      if (!membership?.requestId) return null;
      const updated = await notificationService.retryFailedNotification(membership.requestId, options);
      setNotificationRecord(updated);
      return updated;
    },
    [membership?.requestId]
  );

  const completeAcademicProfile = useCallback(
    async (data: {
      fullName: string;
      rollNumber: string;
      department: string;
      year: string;
      semester: string;
      section: string;
      session: string;
    }): Promise<StudentProfile> => {
      if (!user?.uid) {
        throw new Error('Authentication required.');
      }
      const updated = await membershipService.completeAcademicProfile(user.uid, data);
      setProfile(updated);
      return updated;
    },
    [user?.uid]
  );

  const completeTimetableSetup = useCallback(
    async (slotsCount?: number): Promise<StudentProfile> => {
      if (!user?.uid) {
        throw new Error('Authentication required.');
      }
      const updated = await membershipService.completeTimetableSetup(user.uid, slotsCount);
      setProfile(updated);
      return updated;
    },
    [user?.uid]
  );

  const attemptStudentStatusMutation = useCallback(
    async (targetStatus: MembershipStatus): Promise<never> => {
      if (!user?.uid) {
        throw new Error('Authentication required.');
      }
      return membershipService.attemptStudentStatusMutation(user.uid, targetStatus);
    },
    [user?.uid]
  );

  const resolveDestinationPath = useCallback(
    (
      intendedPath?: string,
      overrideMembership?: StudentMembership | null,
      overrideProfile?: StudentProfile | null
    ): string => {
      const activeMembership = overrideMembership !== undefined ? overrideMembership : membership;
      const activeProfile = overrideProfile !== undefined ? overrideProfile : profile;

      if (!activeMembership) return '/welcome';

      switch (activeMembership.status) {
        case MembershipStatus.PENDING:
          return '/pending-approval';
        case MembershipStatus.REJECTED:
          return '/application-rejected';
        case MembershipStatus.SUSPENDED:
          return '/account-suspended';
        case MembershipStatus.APPROVED: {
          if (!activeProfile?.academicProfileCompleted) {
            return '/setup-profile';
          }
          if (!activeProfile?.timetableCompleted) {
            return '/timetable-setup';
          }
          const safeIntended =
            intendedPath &&
            !['/welcome', '/login', '/join', '/pending-approval', '/application-rejected', '/account-suspended', '/setup-profile', '/timetable-setup', '/', '/splash'].includes(intendedPath)
              ? intendedPath
              : '/discover';
          return safeIntended;
        }
      }
    },
    [membership, profile]
  );

  const authState: AuthStateStatus = useMemo(() => {
    if (isAuthLoading || (user && isMembershipLoading && !membership)) {
      return 'loading';
    }
    return mapMembershipToAuthState(user, membership);
  }, [isAuthLoading, isMembershipLoading, user, membership]);

  const academicProfileCompleted = Boolean(profile?.academicProfileCompleted);
  const timetableCompleted = Boolean(profile?.timetableCompleted);

  const status: StudentStatus = useMemo(() => {
    switch (authState) {
      case 'approved':
        return 'approved';
      case 'pending':
        return 'pending';
      case 'rejected':
        return 'rejected';
      case 'suspended':
        return 'suspended';
      case 'unauthenticated':
      case 'loading':
      default:
        return 'logged_out';
    }
  }, [authState]);

  const studentData: LegacyStudentData = useMemo(
    () => ({
      name: profile?.fullName || membership?.fullName || user?.displayName || 'IDEA Lab Student',
      email: membership?.email || user?.email || '',
      rollNumber: profile?.rollNumber || membership?.rollNumber || '',
      department: profile?.department || membership?.department || 'AI & Data Science',
      year: profile?.year || membership?.year || '3rd Year',
      requestId: membership?.requestId,
      submittedDate: membership?.requestedAt
        ? new Date(membership.requestedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : undefined,
    }),
    [profile, membership, user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        membership,
        profile,
        authState,
        isAuthLoading,
        isMembershipLoading,
        academicProfileCompleted,
        timetableCompleted,
        notificationRecord,
        authError,
        clearAuthError,
        signInWithGoogle,
        signInWithEmail,
        submitJoinRequest,
        signOut,
        refreshMembership,
        retryCoordinatorNotification,
        completeAcademicProfile,
        completeTimetableSetup,
        attemptStudentStatusMutation,
        resolveDestinationPath,
        status,
        studentData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
