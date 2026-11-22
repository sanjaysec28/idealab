import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';

export const SPLASH_EXIT_START_MS = 4500;
export const SPLASH_FADE_OUT_MS = 500;
export const SPLASH_TOTAL_DURATION_MS = SPLASH_EXIT_START_MS + SPLASH_FADE_OUT_MS; // 5000ms

interface LoadingContextType {
  isSplashActive: boolean;
  isSplashVisible: boolean;
  hasCompletedInitialSplash: boolean;
  isBackgroundRefreshing: boolean;
  initError: string | null;
  dismissSplashIfReady: () => void;
  clearInitError: () => void;
  startBackgroundRefresh: () => () => void;
  withBackgroundRefresh: <T>(task: Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState, authError } = useAuth();

  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  const [isSplashVisible, setIsSplashVisible] = useState<boolean>(true);
  const [hasCompletedInitialSplash, setHasCompletedInitialSplash] = useState<boolean>(false);
  const [sequenceExitReady, setSequenceExitReady] = useState<boolean>(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState<number>(0);

  const closingRef = useRef<boolean>(false);
  const fadeTimerRef = useRef<number | null>(null);

  // Trigger Phase 3 exit at exact 4.5s so total splash duration completes at 5.0s
  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setSequenceExitReady(true);
    }, SPLASH_EXIT_START_MS);

    return () => {
      window.clearTimeout(exitTimer);
      if (fadeTimerRef.current !== null) {
        window.clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
    };
  }, []);

  const finishSplash = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    if (authError) {
      setInitError(authError);
    } else if (authState === 'loading') {
      setInitError('Initialization took longer than expected. Continuing with cached session.');
    }

    setIsSplashVisible(false);

    fadeTimerRef.current = window.setTimeout(() => {
      fadeTimerRef.current = null;
      setIsSplashActive(false);
      setHasCompletedInitialSplash(true);
    }, SPLASH_FADE_OUT_MS);
  }, [authError, authState]);

  useEffect(() => {
    if (!sequenceExitReady || closingRef.current) return;
    finishSplash();
  }, [sequenceExitReady, finishSplash]);

  const dismissSplashIfReady = useCallback(() => {
    if (authState !== 'loading' && sequenceExitReady) {
      finishSplash();
    }
  }, [authState, finishSplash, sequenceExitReady]);

  const clearInitError = useCallback(() => {
    setInitError(null);
  }, []);

  useEffect(() => {
    if (authState !== 'loading' && !authError) {
      setInitError(null);
    }
  }, [authState, authError]);

  const startBackgroundRefresh = useCallback(() => {
    setRefreshCount((c) => c + 1);
    let stopped = false;
    return () => {
      if (stopped) return;
      stopped = true;
      setRefreshCount((c) => Math.max(0, c - 1));
    };
  }, []);

  const withBackgroundRefresh = useCallback(
    async <T,>(task: Promise<T>): Promise<T> => {
      const stop = startBackgroundRefresh();
      try {
        return await task;
      } finally {
        stop();
      }
    },
    [startBackgroundRefresh]
  );

  return (
    <LoadingContext.Provider
      value={{
        isSplashActive,
        isSplashVisible,
        hasCompletedInitialSplash,
        isBackgroundRefreshing: refreshCount > 0,
        initError,
        dismissSplashIfReady,
        clearInitError,
        startBackgroundRefresh,
        withBackgroundRefresh,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return ctx;
};
