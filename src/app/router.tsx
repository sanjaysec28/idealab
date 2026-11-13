import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { StudentLayout } from '../layouts/StudentLayout';
import { AuthGuard } from '../components/auth/AuthGuard';
import { MembershipGuard } from '../components/auth/MembershipGuard';
import { SplashScreen } from '../pages/auth/SplashScreen';
import { WelcomePage } from '../pages/auth/WelcomePage';
import { OnboardingPage } from '../pages/auth/OnboardingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { JoinPage } from '../pages/auth/JoinPage';
import { SetupProfilePage } from '../pages/auth/SetupProfilePage';
import { TimetableSetupPage } from '../pages/auth/TimetableSetupPage';
import { PendingApprovalPage } from '../pages/auth/PendingApprovalPage';
import { ApplicationRejectedPage } from '../pages/auth/ApplicationRejectedPage';
import { AccountSuspendedPage } from '../pages/auth/AccountSuspendedPage';
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
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/join',
    element: <JoinPage />,
  },
  {
    path: '/pending-approval',
    element: (
      <AuthGuard>
        <PendingApprovalPage />
      </AuthGuard>
    ),
  },
  {
    path: '/application-rejected',
    element: (
      <AuthGuard>
        <ApplicationRejectedPage />
      </AuthGuard>
    ),
  },
  {
    path: '/account-suspended',
    element: (
      <AuthGuard>
        <AccountSuspendedPage />
      </AuthGuard>
    ),
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <MembershipGuard />,
        children: [
          {
            path: '/setup-profile',
            element: <SetupProfilePage />,
          },
          {
            path: '/timetable-setup',
            element: <TimetableSetupPage />,
          },
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
