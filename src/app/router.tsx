import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { StudentLayout } from '../layouts/StudentLayout';
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
import { DiscoverPage } from '../pages/discover/DiscoverPage';
import { ExplorePage } from '../pages/explore/ExplorePage';
import { ProjectsPage } from '../pages/projects/ProjectsPage';
import { IdeasPage } from '../pages/ideas/IdeasPage';
import { CommunityPage } from '../pages/community/CommunityPage';
import { LeaderboardPage } from '../pages/leaderboard/LeaderboardPage';
import { AchievementsPage } from '../pages/achievements/AchievementsPage';
import { EventsPage } from '../pages/events/EventsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { SettingsPage } from '../pages/settings/SettingsPage';

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
    element: <AuthGuard />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <StudentLayout />,
            children: [
              { path: '/discover', element: <DiscoverPage /> },
              { path: '/explore', element: <ExplorePage /> },
              { path: '/projects', element: <ProjectsPage /> },
              { path: '/ideas', element: <IdeasPage /> },
              { path: '/community', element: <CommunityPage /> },
              { path: '/leaderboard', element: <LeaderboardPage /> },
              { path: '/achievements', element: <AchievementsPage /> },
              { path: '/events', element: <EventsPage /> },
              { path: '/profile', element: <ProfilePage /> },
              { path: '/settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
