import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from '../context/AuthContext';
import { LoadingProvider } from '../context/LoadingContext';
import { AppSplashOverlay } from '../components/shared/AppSplashOverlay';
import { BackgroundRefreshBar } from '../components/shared/BackgroundRefreshBar';

export const Providers: React.FC = () => {
  return (
    <AuthProvider>
      <LoadingProvider>
        <BackgroundRefreshBar />
        <RouterProvider router={router} />
        <AppSplashOverlay />
      </LoadingProvider>
    </AuthProvider>
  );
};
