import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { authState, resolveDestinationPath } = useAuth();
  const { isSplashVisible, hasCompletedInitialSplash } = useLoading();

  useEffect(() => {
    if (isSplashVisible && !hasCompletedInitialSplash) return;

    if (authState === 'loading' || authState === 'unauthenticated') {
      navigate('/welcome', { replace: true });
      return;
    }

    navigate(resolveDestinationPath(), { replace: true });
  }, [
    authState,
    isSplashVisible,
    hasCompletedInitialSplash,
    navigate,
    resolveDestinationPath,
  ]);

  return <div className="min-h-[100dvh] w-full idea-splash-backdrop" aria-hidden="true" />;
};
