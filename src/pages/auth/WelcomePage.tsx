import React from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../../utils/assets';
import { IdeaLabLogo } from '../../components/shared/IdeaLabLogo';

export const WelcomePage: React.FC = () => {
  return (
    <main className="min-h-[100dvh] w-full bg-[#FAF8F5] text-[#202124] overflow-x-clip lg:h-[100dvh] lg:overflow-hidden">
      {/* MOBILE / TABLET (< lg): Edge-to-edge mob-card.png -> Get Started -> Sign In */}
      <div className="flex flex-col w-full min-h-[100dvh] lg:hidden">
        <div className="w-full p-0 m-0 mobile-welcome-hero-mask">
          <img
            src={ASSETS.welcomeHeroMobile}
            alt="IDEA LAB Saveetha Engineering College — Innovate. Build. Collaborate. The digital home for IDEA LAB members."
            referrerPolicy="no-referrer"
            draggable={false}
            className="w-full h-auto block object-contain select-none"
          />
        </div>

        <div className="w-full px-5 pt-3 pb-[max(24px,env(safe-area-inset-bottom))]">
          <div className="w-full max-w-md mx-auto space-y-3">
            <Link
              to="/signup"
              className="w-full h-[52px] px-6 rounded-full bg-[#E63946] hover:bg-[#d62839] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-[#E63946]/25 transition-all flex items-center justify-center"
            >
              <span className="whitespace-nowrap">Get Started</span>
            </Link>

            <div className="pt-1 text-center">
              <p className="text-xs text-[#777777]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#E63946] font-bold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP (>= lg): Unchanged Split Layout */}
      <div className="hidden lg:flex lg:flex-row lg:w-full lg:h-full">
        {/* Left Authentication Panel on Desktop */}
        <section className="flex flex-col justify-center w-[40%] xl:w-[39%] h-full bg-transparent relative z-10 px-10 xl:px-14 py-10 overflow-hidden">
          <div className="flex relative z-10 w-full max-w-[440px] mx-auto p-0 flex-col items-start text-left">
            <IdeaLabLogo variant="auth" />

            {/* Main Heading */}
            <div className="mt-10">
              <h1 className="text-[36px] xl:text-[42px] font-extrabold tracking-tight leading-[1.15] text-[#202124]">
                Innovate.{' '}
                <span className="text-[#E63946] relative inline-block">
                  Build.
                  <svg
                    className="block absolute -top-3.5 -right-5 w-5 h-5 text-[#E63946]"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M8 14L13 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M13 17L20 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>
                <br />
                Collaborate.
              </h1>

              <p className="mt-4 text-[15px] text-[#5F6368] font-medium leading-relaxed">
                The digital home for IDEA LAB members.
              </p>
            </div>
          </div>

          {/* Primary Get Started CTA & Sign-In Link */}
          <div className="relative z-10 mt-9 bg-transparent p-0 w-full max-w-[440px] mx-auto shrink-0">
            <div className="w-full space-y-3.5">
              <Link
                to="/signup"
                className="w-full h-12 px-6 rounded-full bg-[#E63946] hover:bg-[#d62839] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-[#E63946]/25 transition-all flex items-center justify-center"
              >
                <span className="whitespace-nowrap">Get Started</span>
              </Link>

              <div className="pt-6 mt-7 border-t border-[#E8E4DC] text-center">
                <p className="text-[13px] text-[#777777]">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#E63946] font-bold hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Subtle Decorative Coral Waves at Bottom-Left (Desktop) */}
          <svg
            className="block absolute bottom-0 left-0 w-72 h-36 pointer-events-none select-none"
            viewBox="0 0 320 160"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 40C45 35 72 80 120 92C168 104 210 112 255 160H0V40Z"
              fill="#FBE2E5"
              fillOpacity="0.7"
            />
            <path
              d="M0 88C40 82 78 115 118 128C155 140 175 146 196 160H0V88Z"
              fill="#F8C8CD"
              fillOpacity="0.55"
            />
          </svg>
        </section>

        {/* Right Illustration Panel with Natural CSS Mask Blending */}
        <section className="flex-none -ml-12 xl:-ml-16 w-[calc(60%+3rem)] xl:w-[calc(61%+4rem)] h-full flex items-center justify-center overflow-hidden p-0 bg-transparent">
          <div className="w-full h-full overflow-hidden welcome-hero-mask">
            <img
              src={ASSETS.welcomeHero}
              alt="IDEA LAB students collaborating on Saveetha Engineering College campus"
              referrerPolicy="no-referrer"
              className="w-full h-full block object-cover object-[46%_45%] select-none"
            />
          </div>
        </section>
      </div>
    </main>
  );
};
