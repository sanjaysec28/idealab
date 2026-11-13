import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Logo } from '../../components/navigation/Logo';
import { useAuth } from '../../context/AuthContext';
import { getSignupDraft } from '../../firebase/authService';
import { AuthLoadingScreen } from '../../components/auth/AuthGuard';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'AI & Data Science',
  'Information Technology',
  'Electronics & Communication Engg',
  'Electrical & Electronics Engg',
  'Mechanical Engineering',
  'Biomedical Engineering',
];

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const MembershipRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    authState,
    submitMembershipRequest,
    signOut,
    resolveDestinationPath,
    isBusy,
  } = useAuth();

  const draft = user ? getSignupDraft(user.uid) : null;

  const [fullName, setFullName] = useState(draft?.fullName || user?.displayName || '');
  const [registrationNumber, setRegistrationNumber] = useState(draft?.registrationNumber || '');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [academicYear, setAcademicYear] = useState('3rd Year');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !fullName && (draft?.fullName || user.displayName)) {
      setFullName(draft?.fullName || user.displayName || '');
    }
    if (user && !registrationNumber && draft?.registrationNumber) {
      setRegistrationNumber(draft.registrationNumber);
    }
  }, [user, draft?.fullName, draft?.registrationNumber, fullName, registrationNumber]);

  useEffect(() => {
    if (authState === 'loading') return;
    if (authState === 'unauthenticated' || !user) {
      navigate('/welcome', { replace: true });
      return;
    }
    if (authState === 'unverified_email') {
      navigate('/verify-email', { replace: true });
      return;
    }
    if (authState !== 'needs_membership_request') {
      navigate(resolveDestinationPath(), { replace: true });
    }
  }, [authState, user, navigate, resolveDestinationPath]);

  if (authState === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (!user || !user.emailVerified) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await submitMembershipRequest({
        fullName,
        registrationNumber,
        department,
        academicYear,
      });
      navigate('/pending-approval', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit membership request.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome', { replace: true });
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-[#202124] flex flex-col justify-between px-5 py-6 sm:py-8">
      <div className="max-w-[460px] w-full mx-auto flex items-center justify-between">
        <Logo size="sm" />
        <button
          type="button"
          onClick={handleSignOut}
          className="text-xs font-medium text-[#777777] hover:text-[#202124] cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      <div className="max-w-[460px] w-full mx-auto my-6 bg-white rounded-2xl border border-[#EEEEEE] shadow-xs p-6 sm:p-8 space-y-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#32B878]/10 text-[#1F7A4D] text-[11px] font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Email Verified</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202124]">
            Submit membership request
          </h1>
          <p className="text-xs text-[#777777]">
            Confirm your academic details so IDEA LAB coordinators can review your membership.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-[#202124] mb-1">
              Verified Email
            </label>
            <input
              type="email"
              readOnly
              value={user.email || ''}
              className="w-full h-10 bg-[#FAF8F5] border border-[#EEEEEE] rounded-xl px-3.5 text-xs text-[#777777] cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#202124] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ananya Sharma"
                className="w-full h-10 bg-white border border-[#EEEEEE] rounded-xl px-3.5 text-xs text-[#202124] focus:outline-none focus:border-[#E63946] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#202124] mb-1">
                Registration Number
              </label>
              <input
                type="text"
                required
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="212224040001"
                className="w-full h-10 bg-white border border-[#EEEEEE] rounded-xl px-3.5 text-xs text-[#202124] focus:outline-none focus:border-[#E63946] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#202124] mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-10 bg-white border border-[#EEEEEE] rounded-xl px-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946] transition-colors"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#202124] mb-1">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full h-10 bg-white border border-[#EEEEEE] rounded-xl px-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946] transition-colors"
              >
                {ACADEMIC_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isBusy}
            className="w-full h-10.5 mt-2 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isBusy ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <span>Submit Membership Request</span>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-[11px] text-[#777777]">
        Coordinator approval is required before dashboard access is activated.
      </p>
    </div>
  );
};
