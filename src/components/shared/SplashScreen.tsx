import React, { useEffect, useState } from 'react';
import { ASSETS } from '../../utils/assets';

export interface SplashScreenProps {
  visible?: boolean;
  onSkip?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  visible = true,
  onSkip,
}) => {
  const [imageReady, setImageReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let active = true;
    const img = new Image();
    img.src = ASSETS.splashScreen;

    if (img.complete) {
      setImageReady(true);
      return;
    }

    const markReady = () => {
      if (active) setImageReady(true);
    };

    img.addEventListener('load', markReady);
    img.addEventListener('error', markReady);
    return () => {
      active = false;
      img.removeEventListener('load', markReady);
      img.removeEventListener('error', markReady);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading IDEA LAB"
      onClick={onSkip}
      className={`fixed inset-0 z-[100] w-full h-[100dvh] overflow-hidden select-none idea-splash-backdrop transition-opacity duration-300 ease-out motion-reduce:transition-none ${
        visible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`idea-splash-canvas transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          mounted && imageReady ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />
    </div>
  );
};
