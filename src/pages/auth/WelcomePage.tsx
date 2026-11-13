import React from 'react';
import { Link } from 'react-router-dom';
import { ASSETS } from '../../utils/assets';
import { IdeaLabLogo } from '../../components/shared/IdeaLabLogo';

export const WelcomePage: React.FC = () => {
  return (
    <main className="min-h-[100dvh] md:h-auto md:min-h-[100dvh] w-full bg-[#FAF8F5] text-[#202124] flex flex-col justify-between overflow-x-clip lg:flex-row lg:h-[100dvh] lg:overflow-hidden">
      {/* Left Authentication Panel on Desktop / Unwrapped via display:contents on Mobile & Tablet */}
      <section className="contents lg:flex lg:flex-col lg:justify-center lg:w-[40%] xl:w-[39%] lg:h-full lg:bg-transparent lg:relative lg:z-10 lg:px-10 xl:px-14 lg:py-10 lg:overflow-hidden">
        {/* 1. Brand Lockup + Heading (All Viewports — uses official logo.png without baked-in mobile logo) */}
        <div className="flex order-1 lg:order-none relative z-10 w-full max-w-[440px] mx-auto px-5 pt-6 pb-3 md:pt-7 lg:p-0 flex-col items-center lg:items-start text-center lg:text-left">
          <IdeaLabLogo variant="auth" />

          {/* Main Heading */}
          <div className="mt-4 sm:mt-5 lg:mt-10">
            <h1 className="text-[28px] sm:text-4xl lg:text-[36px] xl:text-[42px] font-extrabold tracking-tight leading-[1.15] text-[#202124]">
              Innovate.{' '}
              <span className="text-[#E63946] relative inline-block">
                Build.
                <svg
                  className="hidden lg:block absolute -top-3.5 -right-5 w-5 h-5 text-[#E63946]"
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

            <p className="mt-2 sm:mt-3 lg:mt-4 text-xs sm:text-sm lg:text-[15px] text-[#5F6368] font-medium leading-relaxed">
              The digital home for IDEA LAB members.
            </p>
          </div>
        </div>

        {/* 3. Primary Get Started CTA & Sign-In Link */}
        <div className="order-3 lg:order-none relative z-10 flex-1 flex flex-col justify-center md:flex-none mt-2 md:mt-0 lg:mt-9 bg-transparent px-5 pt-2 pb-[max(20px,env(safe-area-inset-bottom))] md:pt-4 md:pb-10 lg:p-0 w-full lg:max-w-[440px] lg:mx-auto shrink-0">
          <div className="max-w-md mx-auto lg:max-w-none w-full space-y-3 lg:space-y-3.5">
            <Link
              to="/signup"
              className="w-full h-[52px] md:h-12 px-6 rounded-full bg-[#E63946] hover:bg-[#d62839] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-[#E63946]/25 transition-all flex items-center justify-center"
            >
              <span className="whitespace-nowrap">Get Started</span>
            </Link>

            <div className="pt-2 lg:pt-6 lg:mt-7 lg:border-t lg:border-[#E8E4DC] text-center">
              <p className="text-xs lg:text-[13px] text-[#777777]">
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
          className="hidden lg:block absolute bottom-0 left-0 w-72 h-36 pointer-events-none select-none"
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

      {/* 2. Responsive Illustration Panel with Natural CSS Mask Blending */}
      <section className="order-2 lg:order-none w-full flex-none md:flex-none lg:-ml-12 xl:-ml-16 lg:w-[calc(60%+3rem)] xl:w-[calc(61%+4rem)] lg:h-full flex items-center justify-center overflow-hidden p-0 md:px-8 md:py-4 lg:p-0 bg-transparent">
        <div className="w-full h-[220px] sm:h-[280px] md:h-auto md:max-w-[480px] lg:max-w-none lg:h-full overflow-hidden welcome-hero-mask">
          <img
            src={ASSETS.welcomeHero}
            alt="IDEA LAB students collaborating on Saveetha Engineering College campus"
            referrerPolicy="no-referrer"
            className="w-full h-full block object-cover object-[52%_36%] lg:object-[46%_45%] select-none"
          />
        </div>
      </section>
    </main>
  );
};
