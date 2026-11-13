import React from 'react';
import { Outlet } from 'react-router-dom';
import { HomeHeader } from '../components/home/HomeHeader';
import { MobileBottomNavigation } from '../components/home/MobileBottomNavigation';

interface WorkInProgressLayoutProps {
  children?: React.ReactNode;
}

export const WorkInProgressLayout: React.FC<WorkInProgressLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-[#202020] flex flex-col overflow-x-clip">
      <HomeHeader />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-14 pb-28 lg:pb-16 flex flex-col items-center justify-start sm:justify-center">
        {children ?? <Outlet />}
      </main>

      <MobileBottomNavigation />
    </div>
  );
};
