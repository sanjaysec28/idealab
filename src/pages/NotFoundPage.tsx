import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { IdeaLabLogo } from '../components/shared/IdeaLabLogo';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { authState, resolveDestinationPath } = useAuth();

  const isAuthenticated = authState !== 'unauthenticated' && authState !== 'loading';
  const primaryPath = isAuthenticated ? resolveDestinationPath() : '/welcome';
  const primaryLabel =
    primaryPath === '/home'
      ? 'Go to Home'
      : primaryPath === '/timetable'
        ? 'Go to Timetable'
        : primaryPath === '/verify-email'
          ? 'Verify Email'
          : 'Back to Welcome';

  return (
    <main className="min-h-[100dvh] w-full bg-[#FAF8F5] text-[#202020] flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_2px_16px_rgba(32,33,36,0.04)] p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-5">
          <IdeaLabLogo variant="compact" />
        </div>

        <p className="text-xs font-extrabold tracking-widest uppercase text-[#E63946] tabular-nums">
          Error 404
        </p>

        <h1 className="mt-2 text-2xl sm:text-[26px] font-extrabold tracking-tight text-[#202020] text-balance">
          Page Not Found
        </h1>

        <p className="mt-2.5 text-sm text-[#5F6368] leading-relaxed">
          The page you requested does not exist or may have been moved inside IDEA LAB.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
          <Link
            to={primaryPath}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#E63946]/20 inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>{primaryLabel}</span>
          </Link>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#EAE6E1] text-[#202020] text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </main>
  );
};
