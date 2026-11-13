import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IS_TIMETABLE_TESTING_MODE } from '../../config/featureFlags';
import { AuthLoadingScreen } from './AuthGuard';

export const MembershipGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  const location = useLocation();

  if (authState === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (authState === 'unauthenticated') {
    return (
      <Navigate
        to="/welcome"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (authState === 'unverified_email') {
    return <Navigate to="/verify-email" replace />;
  }

  if (authState === 'needs_membership_request') {
    return <Navigate to="/membership-request" replace />;
  }

  if (authState === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (authState === 'rejected') {
    return <Navigate to="/membership-rejected" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const ProtectedRoute = MembershipGuard;

/**
 * Route guard for the Timetable Builder.
 * - Requires authenticated Firebase user + verified email in all modes.
 * - In testing mode (`IS_TIMETABLE_TESTING_MODE`), grants direct access without
 *   requiring membership submission or coordinator approval.
 * - In production mode, enforces the full approved-membership check.
 */
export const VerifiedEmailGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { authState, user } = useAuth();
  const location = useLocation();

  if (authState === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (!user || authState === 'unauthenticated') {
    return (
      <Navigate
        to="/welcome"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (!user.emailVerified || authState === 'unverified_email') {
    return <Navigate to="/verify-email" replace />;
  }

  if (!IS_TIMETABLE_TESTING_MODE && authState !== 'approved') {
    if (authState === 'needs_membership_request') {
      return <Navigate to="/membership-request" replace />;
    }
    if (authState === 'pending') {
      return <Navigate to="/pending-approval" replace />;
    }
    if (authState === 'rejected') {
      return <Navigate to="/membership-rejected" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
