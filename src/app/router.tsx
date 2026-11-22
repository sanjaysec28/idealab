import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { WorkInProgressLayout } from '../layouts/WorkInProgressLayout';
import { WorkInProgress } from '../components/shared/WorkInProgress';
import { AuthGuard } from '../components/auth/AuthGuard';
import {
  AdminGuard,
  ProfileSetupGuard,
  ProtectedRoute,
  VerifiedEmailGuard,
} from '../components/auth/MembershipGuard';
import { SplashScreen } from '../pages/auth/SplashScreen';
import { WelcomePage } from '../pages/auth/WelcomePage';
import { CompleteProfilePage } from '../pages/auth/CompleteProfilePage';
import { HomePage } from '../pages/home/HomePage';
import { TimetablePage } from '../pages/timetable/TimetablePage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { AdminTimetablePage } from '../pages/admin/AdminTimetablePage';
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
  // Legacy auth routes redirected cleanly to Google Sign-In Welcome flow
  {
    path: '/onboarding',
    element: <Navigate to="/welcome" replace />,
  },
  {
    path: '/signup',
    element: <Navigate to="/welcome" replace />,
  },
  {
    path: '/login',
    element: <Navigate to="/welcome" replace />,
  },
  {
    path: '/signin',
    element: <Navigate to="/welcome" replace />,
  },
  {
    path: '/join',
    element: <Navigate to="/welcome" replace />,
  },
  {
    path: '/verify-email',
    element: <Navigate to="/welcome" replace />,
  },
  {
    path: '/complete-profile',
    element: (
      <AuthGuard>
        <ProfileSetupGuard>
          <CompleteProfilePage />
        </ProfileSetupGuard>
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
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </AuthGuard>
    ),
  },
  {
    path: '/admin/timetables',
    element: (
      <AuthGuard>
        <AdminGuard>
          <AdminTimetablePage />
        </AdminGuard>
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
