import React, { useEffect, useState } from 'react';
import { ASSETS } from '../../utils/assets';

export interface SplashScreenProps {
  visible?: boolean;
}

const PHASE_SEC_FADE_OUT_MS = 1650;
const PHASE_IDEA_FADE_IN_MS = 2000;
const PHASE_EXIT_FADE_OUT_MS = 4500;

export const SplashScreen: React.FC<SplashScreenProps> = ({ visible = true }) => {
  const [secVisible, setSecVisible] = useState(false);
  const [ideVisible, setIdeVisible] = useState(false);

  // Preload both splash logos immediately to avoid flickering or delayed fade-ins
  useEffect(() => {
    const urls = [ASSETS.splashSecLogo, ASSETS.splashIdeaLogo];
    const preloadedImages: HTMLImageElement[] = [];

    for (const url of urls) {
      const img = new Image();
      img.src = url;
      if (typeof img.decode === 'function') {
        void img.decode().catch(() => {});
      }
      preloadedImages.push(img);
    }

    return () => {
      for (const img of preloadedImages) {
        img.onload = null;
        img.onerror = null;
      }
    };
  }, []);

  // Exact 5-second dual-logo sequence:
  // 0–2s: spl-sec.webp fade in & hold -> smooth fade out (1.65s–2.0s)
  // 2–4.5s: spl-ide.webp fade in & hold for 2.5s
  // 4.5–5s: spl-ide.webp smooth fade out + full splash fade out
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      setSecVisible(true);
    });

    const secOutTimer = window.setTimeout(() => {
      setSecVisible(false);
    }, PHASE_SEC_FADE_OUT_MS);

    const ideInTimer = window.setTimeout(() => {
      setIdeVisible(true);
    }, PHASE_IDEA_FADE_IN_MS);

    const ideOutTimer = window.setTimeout(() => {
      setIdeVisible(false);
    }, PHASE_EXIT_FADE_OUT_MS);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(secOutTimer);
      window.clearTimeout(ideInTimer);
      window.clearTimeout(ideOutTimer);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="IDEA LAB"
      className={`fixed inset-0 z-[100] w-full h-[100dvh] overflow-hidden select-none idea-splash-backdrop flex items-center justify-center p-6 sm:p-10 md:p-14 transition-opacity duration-500 ease-out motion-reduce:transition-none ${
        visible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Subtle Decorative Brand Waves */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -right-20 w-96 h-96 rounded-full bg-white/10"
      />

      {/* Centered Dual-Logo Stage */}
      <div className="relative z-10 w-full max-w-[260px] sm:max-w-[340px] md:max-w-[400px] lg:max-w-[440px] h-[160px] sm:h-[200px] md:h-[230px] lg:h-[250px] flex items-center justify-center">
        <img
          src={ASSETS.splashSecLogo}
          alt="Saveetha Engineering College"
          draggable={false}
          className={`absolute inset-0 m-auto max-w-full max-h-full w-auto h-auto object-contain p-3 sm:p-4 select-none transition-opacity duration-[350ms] ease-out motion-reduce:transition-none ${
            secVisible && visible ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <img
          src={ASSETS.splashIdeaLogo}
          alt="AICTE IDEA LAB"
          draggable={false}
          className={`absolute inset-0 m-auto max-w-full max-h-full w-auto h-auto object-contain p-3 sm:p-4 select-none transition-opacity duration-[450ms] ease-out motion-reduce:transition-none ${
            ideVisible && visible ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    </div>
  );
};
