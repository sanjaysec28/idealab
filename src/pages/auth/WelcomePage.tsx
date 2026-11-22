import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFriendlyFirebaseErrorMessage } from '../../firebase/errorHandling';
import { AuthLoadingScreen } from '../../components/auth/AuthGuard';
import { ASSETS } from '../../utils/assets';
import { IdeaLabLogo } from '../../components/shared/IdeaLabLogo';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authState, signInWithGoogle, resolveDestinationPath, authError, clearAuthError } =
    useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const intendedFrom =
    (location.state as { from?: string } | null)?.from ?? undefined;

  useEffect(() => {
    if (authState !== 'loading' && authState !== 'unauthenticated') {
      navigate(resolveDestinationPath(intendedFrom), { replace: true });
    }
  }, [authState, intendedFrom, navigate, resolveDestinationPath]);

  if (authState !== 'unauthenticated') {
    return <AuthLoadingScreen />;
  }

  const handleContinueWithGoogle = async () => {
    if (isSubmitting) return;
    setLocalError(null);
    clearAuthError();
    setIsSubmitting(true);
    try {
      const nextState = await signInWithGoogle();
      navigate(resolveDestinationPath(intendedFrom, nextState), { replace: true });
    } catch (err) {
      setLocalError(
        getFriendlyFirebaseErrorMessage(
          err,
          'Unable to sign in with Google. Please try again.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError =
    localError ||
    (authError
      ? getFriendlyFirebaseErrorMessage(authError, 'Unable to verify your session. Please try again.')
      : null);

  const renderGoogleButton = (heightClass: string) => (
    <button
      type="button"
      disabled={isSubmitting}
      onClick={() => void handleContinueWithGoogle()}
      className={`w-full ${heightClass} px-6 rounded-full bg-white hover:bg-[#FFF8F8] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E63946] border border-[#E63946]/35 hover:border-[#E63946] text-[#202124] font-bold text-sm shadow-sm shadow-[#202124]/5 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-65 disabled:cursor-not-allowed`}
    >
      {isSubmitting ? (
        <span className="w-5 h-5 border-2 border-[#E63946] border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        <GoogleIcon className="w-5 h-5 shrink-0" />
      )}
      <span className="whitespace-nowrap">
        {isSubmitting ? 'Signing in with Google...' : 'Continue with Google'}
      </span>
    </button>
  );

  return (
    <main className="min-h-[100dvh] w-full bg-[#FAF8F5] text-[#202124] overflow-x-clip lg:h-[100dvh] lg:overflow-hidden">
      {/* MOBILE / TABLET (< lg): Edge-to-edge mob-card.webp -> Continue with Google */}
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

        <div className="w-full px-5 pt-4 pb-[max(28px,env(safe-area-inset-bottom))]">
          <div className="w-full max-w-md mx-auto space-y-3">
            {displayError && (
              <div
                role="alert"
                className="p-3 rounded-2xl bg-[#FFF0F1] border border-[#E63946]/30 text-xs font-medium text-[#E63946] flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{displayError}</span>
              </div>
            )}

            {renderGoogleButton('h-[52px]')}

            <p className="text-[11px] text-center text-[#5F6368] leading-relaxed">
              Sign in with your Google account to access Saveetha IDEA LAB.
            </p>
          </div>
        </div>
      </div>

      {/* DESKTOP (>= lg): Preserved Split Layout */}
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

          {/* Primary Google Sign-In CTA */}
          <div className="relative z-10 mt-9 bg-transparent p-0 w-full max-w-[440px] mx-auto shrink-0">
            <div className="w-full space-y-3">
              {displayError && (
                <div
                  role="alert"
                  className="p-3 rounded-2xl bg-[#FFF0F1] border border-[#E63946]/30 text-xs font-medium text-[#E63946] flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{displayError}</span>
                </div>
              )}

              {renderGoogleButton('h-12')}

              <p className="text-xs text-[#5F6368] text-center">
                One-click sign-in with your verified Google account.
              </p>
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
