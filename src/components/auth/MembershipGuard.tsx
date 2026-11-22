import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLoadingScreen } from './AuthGuard';

/**
 * Route guard for /complete-profile: requires an authenticated Google user,
 * and redirects forward if profile is already completed.
 */
export const ProfileSetupGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { authState, user, resolveDestinationPath } = useAuth();
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

  if (authState !== 'needs_profile') {
    return <Navigate to={resolveDestinationPath()} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

/**
 * Route guard for /timetable: requires authenticated user with completed profile.
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

  if (authState === 'needs_profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

/**
 * Route guard for student platform routes (/home, /profile, /discover, /projects, etc.).
 * Ensures user is authenticated via Google, completed mandatory 6-field profile,
 * and finalized/locked their timetable in Firestore.
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

  if (authState === 'needs_profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  if (
    authState === 'needs_timetable_warning' ||
    authState === 'needs_timetable' ||
    authState === 'timetable_review'
  ) {
    return <Navigate to="/timetable" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

/**
 * Route guard for /admin/timetables: requires verified admin privilege in /admins/{uid}
 * (or custom admin claim). Non-admins are redirected away cleanly.
 */
export const AdminGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { authState, user, isAdmin, isAdminChecked, resolveDestinationPath } = useAuth();
  const location = useLocation();

  if (authState === 'loading' || !isAdminChecked) {
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

  if (!isAdmin) {
    return <Navigate to={resolveDestinationPath()} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
