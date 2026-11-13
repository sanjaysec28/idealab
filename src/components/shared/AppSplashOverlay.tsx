import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { useLoading } from '../../context/LoadingContext';
import { useAuth } from '../../context/AuthContext';
import { SplashScreen } from './SplashScreen';

export const AppSplashOverlay: React.FC = () => {
  const {
    isSplashActive,
    isSplashVisible,
    initError,
    clearInitError,
    dismissSplashIfReady,
    withBackgroundRefresh,
  } = useLoading();
  const { refreshMembership } = useAuth();

  const handleRetry = async () => {
    clearInitError();
    await withBackgroundRefresh(refreshMembership());
  };

  return (
    <>
      {isSplashActive && (
        <SplashScreen visible={isSplashVisible} onSkip={dismissSplashIfReady} />
      )}

      {!isSplashActive && initError && (
        <div
          role="alert"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[85] bg-white rounded-2xl border border-[#EEEEEE] shadow-xl p-3.5 flex items-start gap-3 text-xs text-[#202124]"
        >
          <AlertCircle className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <p className="font-semibold leading-snug">{initError}</p>
            <button
              type="button"
              onClick={() => void handleRetry()}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#E63946] hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry sync</span>
            </button>
          </div>
          <button
            type="button"
            onClick={clearInitError}
            aria-label="Dismiss initialization notice"
            className="text-[#777777] hover:text-[#202124] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
};
