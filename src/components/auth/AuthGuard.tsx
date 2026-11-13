import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';

export const AuthLoadingScreen: React.FC = () => {
  const { isSplashActive } = useLoading();

  // While the branded splash overlay is covering the viewport on initial load/refresh,
  // avoid rendering a competing secondary spinner underneath.
  if (isSplashActive) {
    return <div className="min-h-[100dvh] w-full idea-splash-backdrop" aria-hidden="true" />;
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#FAF8F3] flex flex-col items-center justify-center p-6 text-[#202124]">
      <div className="w-9 h-9 rounded-full border-3 border-[#E63946]/20 border-t-[#E63946] animate-spin mb-3 motion-reduce:animate-none" />
      <p className="text-xs font-semibold text-[#777777] tracking-wide">
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
