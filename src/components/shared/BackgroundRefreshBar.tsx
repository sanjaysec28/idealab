import React from 'react';
import { useLoading } from '../../context/LoadingContext';

export const BackgroundRefreshBar: React.FC = () => {
  const { isBackgroundRefreshing, isSplashActive } = useLoading();

  if (!isBackgroundRefreshing || isSplashActive) {
    return null;
  }

  return (
    <div
      role="progressbar"
      aria-label="Refreshing IDEA LAB data"
      className="fixed top-0 left-0 right-0 h-[3px] z-[90] bg-[#E63946]/15 overflow-hidden pointer-events-none"
    >
      <div className="h-full w-1/2 bg-gradient-to-r from-[#E63946]/40 via-[#E63946] to-[#E63946]/40 rounded-full idea-refresh-indicator" />
    </div>
  );
};
