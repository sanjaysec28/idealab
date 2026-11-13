import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLoadingScreen } from './AuthGuard';

/**
 * Route guard for /timetable and student workflows requiring a verified Firebase account.
 * No coordinator approval or membership request is required.
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

  return children ? <>{children}</> : <Outlet />;
};

/**
 * Route guard for student platform routes (/home, /discover, /projects, etc.).
 * Ensures user is authenticated, email-verified, and has submitted a timetable in Firestore.
 * If verified without a submitted timetable yet, redirects directly to /timetable.
 */
export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
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

  if (authState === 'needs_timetable') {
    return <Navigate to="/timetable" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
