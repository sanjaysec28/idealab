import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
