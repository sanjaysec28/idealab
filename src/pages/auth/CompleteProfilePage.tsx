import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  Hash,
  LogOut,
  MessageCircle,
  Phone,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  checkRegistrationNumberAvailability,
  completeStudentProfile,
} from '../../firebase/studentService';
import {
  DEGREES,
  DEPARTMENTS,
  isValidPhoneNumber,
  isValidRegistrationNumber,
  normalizeRegistrationNumber,
} from '../../utils/academicConstants';
import { IdeaLabLogo } from '../../components/shared/IdeaLabLogo';

export const CompleteProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, studentProfile, refreshStudentData, signOut, resolveDestinationPath } =
    useAuth();

  const uid = user?.uid || '';
  const lockedRegNo = studentProfile?.registrationNumber
    ? normalizeRegistrationNumber(studentProfile.registrationNumber)
    : '';

  const [fullName, setFullName] = useState(
    studentProfile?.fullName || user?.displayName || ''
  );
  const [registrationNumber, setRegistrationNumber] = useState(lockedRegNo);
  const [department, setDepartment] = useState(studentProfile?.department || '');
  const [degree, setDegree] = useState(studentProfile?.degree || '');
  const [phoneNumber, setPhoneNumber] = useState(studentProfile?.phoneNumber || '');
  const [whatsappNumber, setWhatsappNumber] = useState(
    studentProfile?.whatsappNumber || ''
  );
  const [sameAsPhone, setSameAsPhone] = useState(false);

  const [regStatus, setRegStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >(lockedRegNo ? 'available' : 'idle');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sameAsPhone) {
      setWhatsappNumber(phoneNumber);
    }
  }, [phoneNumber, sameAsPhone]);

  useEffect(() => {
    if (lockedRegNo) {
      setRegistrationNumber(lockedRegNo);
      setRegStatus('available');
    }
  }, [lockedRegNo]);

  useEffect(() => {
    if (lockedRegNo || !uid) return;
    const normalized = normalizeRegistrationNumber(registrationNumber);
    if (!normalized) {
      setRegStatus('idle');
      return;
    }
    if (!isValidRegistrationNumber(normalized)) {
      setRegStatus('invalid');
      return;
    }

    let cancelled = false;
    setRegStatus('checking');
    const timer = window.setTimeout(() => {
      void checkRegistrationNumberAvailability(normalized, uid)
        .then((res) => {
          if (cancelled) return;
          setRegStatus(res.available ? 'available' : 'taken');
        })
        .catch(() => {
          if (!cancelled) setRegStatus('idle');
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [registrationNumber, uid, lockedRegNo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !uid) return;

    setError(null);
    const cleanName = fullName.trim();
    const cleanReg = normalizeRegistrationNumber(registrationNumber);
    const cleanDept = department.trim();
    const cleanDegree = degree.trim();
    const cleanPhone = phoneNumber.trim();
    const cleanWa = (sameAsPhone ? phoneNumber : whatsappNumber).trim();

    if (cleanName.length < 2) {
      setError('Please enter your Full Name (minimum 2 characters).');
      return;
    }
    if (!isValidRegistrationNumber(cleanReg)) {
      setError(
        'Please enter a valid Registration Number (4–32 uppercase letters, numbers, or hyphens).'
      );
      return;
    }
    if (!cleanDept) {
      setError('Please select your academic Department.');
      return;
    }
    if (!cleanDegree) {
      setError('Please select your Degree program.');
      return;
    }
    if (!isValidPhoneNumber(cleanPhone)) {
      setError('Please enter a valid Phone Number (7–24 digits).');
      return;
    }
    if (!isValidPhoneNumber(cleanWa)) {
      setError('Please enter a valid WhatsApp Number (7–24 digits).');
      return;
    }

    setIsSaving(true);
    try {
      if (!lockedRegNo) {
        const regCheck = await checkRegistrationNumberAvailability(cleanReg, uid);
        if (!regCheck.available) {
          setRegStatus('taken');
          throw new Error(
            'This Registration Number is already registered to another student.'
          );
        }
      }

      await completeStudentProfile(uid, {
        fullName: cleanName,
        registrationNumber: cleanReg,
        department: cleanDept,
        degree: cleanDegree,
        phoneNumber: cleanPhone,
        whatsappNumber: cleanWa,
      });

      await refreshStudentData();
      navigate(resolveDestinationPath('/timetable'), { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to save your profile. Please retry.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/welcome', { replace: true });
  };

  return (
    <main className="min-h-[100dvh] w-full bg-[#FAF8F5] text-[#202124] flex flex-col">
      {/* Top Bar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#EAE6E1]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <IdeaLabLogo variant="compact" />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-medium text-[#5F6368] truncate max-w-[220px]">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-semibold text-[#555555] hover:text-[#E63946] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Card */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-xl bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_4px_24px_rgba(32,33,36,0.04)] p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF0F1] text-[#E63946] text-[11px] font-bold uppercase tracking-wider">
              Step 1 of 2 · Student Profile
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#202124]">
              Complete Your Student Profile
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6368] leading-relaxed">
              Confirm your academic identity and contact details before creating your one-time semester timetable.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-[#FFF0F1] border border-[#E63946]/30 text-xs font-medium text-[#E63946] flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} noValidate className="space-y-4">
            {/* 1. Full Name */}
            <div>
              <label
                htmlFor="cp-full-name"
                className="block text-xs font-bold text-[#202124] mb-1.5"
              >
                Full Name <span className="text-[#E63946]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="cp-full-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full h-11 rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] pl-10 pr-4 text-sm text-[#202124] outline-none transition-colors"
                />
              </div>
            </div>

            {/* 2. Registration Number */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label
                  htmlFor="cp-reg-no"
                  className="block text-xs font-bold text-[#202124]"
                >
                  Registration Number <span className="text-[#E63946]">*</span>
                </label>
                {regStatus === 'checking' && (
                  <span className="text-[11px] font-medium text-[#777777]">
                    Checking availability...
                  </span>
                )}
                {regStatus === 'available' && registrationNumber.trim().length >= 4 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#177E48]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{lockedRegNo ? 'Verified' : 'Available'}</span>
                  </span>
                )}
                {regStatus === 'taken' && (
                  <span className="text-[11px] font-semibold text-[#E63946]">
                    Already registered
                  </span>
                )}
              </div>
              <div className="relative">
                <Hash className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="cp-reg-no"
                  type="text"
                  required
                  disabled={Boolean(lockedRegNo)}
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., 212222040001"
                  maxLength={32}
                  className="w-full h-11 rounded-xl bg-[#FAF8F5] focus:bg-white disabled:bg-[#F2EFE9] disabled:text-[#777777] disabled:cursor-not-allowed border border-[#EAE6E1] focus:border-[#E63946] pl-10 pr-4 text-sm font-mono uppercase text-[#202124] outline-none transition-colors"
                />
              </div>
              <p className="mt-1 text-[11px] text-[#777777]">
                Unique college register number (cannot be modified later).
              </p>
            </div>

            {/* 3. Department & 4. Degree */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="cp-department"
                  className="block text-xs font-bold text-[#202124] mb-1.5"
                >
                  Department <span className="text-[#E63946]">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="cp-department"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-11 rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] pl-10 pr-3 text-sm text-[#202124] outline-none transition-colors"
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                    {department && !DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number]) && (
                      <option value={department}>{department}</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="cp-degree"
                  className="block text-xs font-bold text-[#202124] mb-1.5"
                >
                  Degree <span className="text-[#E63946]">*</span>
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="cp-degree"
                    required
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full h-11 rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] pl-10 pr-3 text-sm text-[#202124] outline-none transition-colors"
                  >
                    <option value="">Select degree</option>
                    {DEGREES.map((deg) => (
                      <option key={deg} value={deg}>
                        {deg}
                      </option>
                    ))}
                    {degree && !DEGREES.includes(degree as (typeof DEGREES)[number]) && (
                      <option value={degree}>{degree}</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* 5. Phone Number */}
            <div>
              <label
                htmlFor="cp-phone"
                className="block text-xs font-bold text-[#202124] mb-1.5"
              >
                Phone Number <span className="text-[#E63946]">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="cp-phone"
                  type="tel"
                  required
                  maxLength={24}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., +91 98765 43210"
                  className="w-full h-11 rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] pl-10 pr-4 text-sm text-[#202124] outline-none transition-colors tabular-nums"
                />
              </div>
            </div>

            {/* 6. WhatsApp Number */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="cp-whatsapp"
                  className="block text-xs font-bold text-[#202124]"
                >
                  WhatsApp Number <span className="text-[#E63946]">*</span>
                </label>

                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5F6368] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sameAsPhone}
                    onChange={(e) => setSameAsPhone(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-[#E63946] cursor-pointer"
                  />
                  <span>Same as phone number</span>
                </label>
              </div>

              <div className="relative">
                <MessageCircle className="w-4 h-4 text-[#177E48] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="cp-whatsapp"
                  type="tel"
                  required
                  disabled={sameAsPhone}
                  maxLength={24}
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g., +91 98765 43210"
                  className="w-full h-11 rounded-xl bg-[#FAF8F5] focus:bg-white disabled:bg-[#F2EFE9] disabled:text-[#777777] border border-[#EAE6E1] focus:border-[#E63946] pl-10 pr-4 text-sm text-[#202124] outline-none transition-colors tabular-nums"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving || regStatus === 'taken'}
                className="w-full h-12 px-6 rounded-full bg-[#E63946] hover:bg-[#D62839] disabled:bg-[#E63946]/50 text-white text-sm font-bold shadow-md shadow-[#E63946]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Save &amp; Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};
