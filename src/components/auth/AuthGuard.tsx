import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';

import { IdeaLabLogo } from '../shared/IdeaLabLogo';

export const AuthLoadingScreen: React.FC = () => {
  const { isSplashActive } = useLoading();

  if (isSplashActive) {
    return (
      <div
        className="min-h-[100dvh] w-full idea-splash-backdrop flex items-center justify-center p-6"
        aria-hidden="true"
      >
        <IdeaLabLogo variant="splash" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-[#202124]">
      <IdeaLabLogo variant="compact" className="mb-5" />
      <div className="w-8 h-8 rounded-full border-2 border-[#E63946]/20 border-t-[#E63946] animate-spin mb-3 motion-reduce:animate-none" />
      <p className="text-xs font-medium text-[#777777]">
        Verifying your IDEA LAB session...
      </p>
    </div>
  );
};

export const AuthGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { authState, user } = useAuth();
  const location = useLocation();

  if (authState === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (!user || authState === 'unauthenticated') {
    const intended = `${location.pathname}${location.search}`;
    return <Navigate to="/welcome" replace state={{ from: intended }} />;
  }

  return children ? <>{children}</> : <Outlet />;
};
