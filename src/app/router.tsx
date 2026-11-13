import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { WorkInProgressLayout } from '../layouts/WorkInProgressLayout';
import { WorkInProgress } from '../components/shared/WorkInProgress';
import { AuthGuard } from '../components/auth/AuthGuard';
import { ProtectedRoute, VerifiedEmailGuard } from '../components/auth/MembershipGuard';
import { SplashScreen } from '../pages/auth/SplashScreen';
import { WelcomePage } from '../pages/auth/WelcomePage';
import { OnboardingPage } from '../pages/auth/OnboardingPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';
import { HomePage } from '../pages/home/HomePage';
import { TimetablePage } from '../pages/timetable/TimetablePage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SplashScreen />,
  },
  {
    path: '/splash',
    element: <SplashScreen />,
  },
  {
    path: '/welcome',
    element: <WelcomePage />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signin',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/join',
    element: <Navigate to="/signup" replace />,
  },
  {
    path: '/verify-email',
    element: (
      <AuthGuard>
        <VerifyEmailPage />
      </AuthGuard>
    ),
  },
  {
    path: '/timetable',
    element: (
      <AuthGuard>
        <VerifiedEmailGuard>
          <TimetablePage />
        </VerifiedEmailGuard>
      </AuthGuard>
    ),
  },
  {
    path: '/home',
    element: (
      <AuthGuard>
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      </AuthGuard>
    ),
  },
  {
    path: '/profile',
    element: (
      <AuthGuard>
        <VerifiedEmailGuard>
          <ProfilePage />
        </VerifiedEmailGuard>
      </AuthGuard>
    ),
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <WorkInProgressLayout />,
            children: [
              { path: '/discover', element: <WorkInProgress /> },
              { path: '/explore', element: <WorkInProgress /> },
              { path: '/projects', element: <WorkInProgress /> },
              { path: '/ideas', element: <WorkInProgress /> },
              { path: '/community', element: <WorkInProgress /> },
              { path: '/leaderboard', element: <WorkInProgress /> },
              { path: '/achievements', element: <WorkInProgress /> },
              { path: '/events', element: <WorkInProgress /> },
              { path: '/notifications', element: <WorkInProgress /> },
              { path: '/settings', element: <WorkInProgress /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
