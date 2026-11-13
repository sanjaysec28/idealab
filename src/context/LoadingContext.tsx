import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';

const NORMAL_SPLASH_DURATION_MS = 2000;
const REDUCED_MOTION_SPLASH_MS = 450;
const MAX_SPLASH_DURATION_MS = 3000;
const FADE_OUT_MS = 320;

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

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState, authError } = useAuth();

  const [isSplashActive, setIsSplashActive] = useState<boolean>(true);
  const [isSplashVisible, setIsSplashVisible] = useState<boolean>(true);
  const [hasCompletedInitialSplash, setHasCompletedInitialSplash] = useState<boolean>(false);
  const [minElapsed, setMinElapsed] = useState<boolean>(false);
  const [maxTimedOut, setMaxTimedOut] = useState<boolean>(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState<number>(0);

  const closingRef = useRef<boolean>(false);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  // Minimum branded display window (~2s normal, shorter for reduced-motion) + hard 3s cap
  useEffect(() => {
    const minDelay = reducedMotion ? REDUCED_MOTION_SPLASH_MS : NORMAL_SPLASH_DURATION_MS;

    const minTimer = window.setTimeout(() => {
      setMinElapsed(true);
    }, minDelay);

    const maxTimer = window.setTimeout(() => {
      setMaxTimedOut(true);
    }, MAX_SPLASH_DURATION_MS);

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
    };
  }, [reducedMotion]);

  const finishSplash = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    if (authError) {
      setInitError(authError);
    } else if (authState === 'loading') {
      setInitError('Initialization took longer than expected. Continuing with cached session.');
    }

    setIsSplashVisible(false);

    const fadeDelay = reducedMotion ? 0 : FADE_OUT_MS;
    window.setTimeout(() => {
      setIsSplashActive(false);
      setHasCompletedInitialSplash(true);
    }, fadeDelay);
  }, [authError, authState, reducedMotion]);

  // Complete splash once app initialization + min duration are satisfied, or at 3s failsafe
  useEffect(() => {
    if (closingRef.current) return;

    const readyNormally = minElapsed && authState !== 'loading';
    if (readyNormally || maxTimedOut) {
      finishSplash();
    }
  }, [minElapsed, authState, maxTimedOut, finishSplash]);

  const dismissSplashIfReady = useCallback(() => {
    if (authState !== 'loading') {
      finishSplash();
    }
  }, [authState, finishSplash]);

  const clearInitError = useCallback(() => {
    setInitError(null);
  }, []);

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
