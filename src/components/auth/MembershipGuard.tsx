import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLoadingScreen } from './AuthGuard';

export const MembershipGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { authState, academicProfileCompleted, timetableCompleted } = useAuth();
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

  if (authState === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (authState === 'rejected') {
    return <Navigate to="/application-rejected" replace />;
  }

  if (authState === 'suspended') {
    return <Navigate to="/account-suspended" replace />;
  }

  // Approved student onboarding progression checks
  const path = location.pathname;

  if (!academicProfileCompleted) {
    if (path !== '/setup-profile') {
      return <Navigate to="/setup-profile" replace />;
    }
    return children ? <>{children}</> : <Outlet />;
  }

  if (!timetableCompleted) {
    if (path !== '/timetable-setup') {
      return <Navigate to="/timetable-setup" replace />;
    }
    return children ? <>{children}</> : <Outlet />;
  }

  // Both onboarding steps completed — avoid revisiting setup steps
  if (path === '/setup-profile' || path === '/timetable-setup') {
    return <Navigate to="/discover" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
