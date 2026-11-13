import React, { useEffect, useState } from 'react';
import { Check, Loader2, Lock, Pencil, ShieldCheck, X } from 'lucide-react';
import { updateStudentProfileDetails } from '../../firebase/studentService';

interface EditProfileModalProps {
  isOpen: boolean;
  uid: string;
  initialValues: {
    fullName: string;
    email: string;
    registrationNumber: string;
    department: string;
    academicYear: string;
    currentSemester: string;
    location: string;
    phoneNumber: string;
    bio: string;
    membershipStatusLabel: string;
  };
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

const DEPARTMENT_SUGGESTIONS = [
  'AI & Data Science',
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Robotics & Automation',
  'Biomedical Engineering',
  'Cyber Security',
  'AI & Machine Learning',
];

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  uid,
  initialValues,
  onClose,
  onSaved,
}) => {
  const [fullName, setFullName] = useState(initialValues.fullName);
  const [department, setDepartment] = useState(initialValues.department);
  const [academicYear, setAcademicYear] = useState(initialValues.academicYear);
  const [currentSemester, setCurrentSemester] = useState(initialValues.currentSemester);
  const [location, setLocation] = useState(initialValues.location);
  const [phoneNumber, setPhoneNumber] = useState(initialValues.phoneNumber);
  const [bio, setBio] = useState(initialValues.bio);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFullName(initialValues.fullName);
    setDepartment(initialValues.department);
    setAcademicYear(initialValues.academicYear);
    setCurrentSemester(initialValues.currentSemester);
    setLocation(initialValues.location);
    setPhoneNumber(initialValues.phoneNumber);
    setBio(initialValues.bio);
    setError(null);
    setIsSaving(false);
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setError(null);
    setIsSaving(true);
    try {
      await updateStudentProfileDetails(uid, {
        fullName,
        department,
        academicYear,
        currentSemester,
        location,
        phoneNumber,
        bio,
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to save profile changes right now.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-2xl w-full max-w-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE6E1] flex items-center justify-between gap-4 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#202020]">
                Edit Student Profile
              </h2>
              <p className="text-xs text-[#777777]">
                Update your academic details, contact information, and biography.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit profile modal"
            className="w-9 h-9 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-[#777777] hover:text-[#E63946] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#FFF0F1] border border-[#E63946]/30 text-xs text-[#E63946] font-medium">
                {error}
              </div>
            )}

            {/* Protected Identity Fields (Strictly Read-Only) */}
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#202020] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#777777]" />
                  <span>Protected Student Identity (Read-Only)</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#32B878]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{initialValues.membershipStatusLabel}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#777777] mb-1">
                    Verified Email Address
                  </label>
                  <input
                    type="email"
                    value={initialValues.email}
                    disabled
                    readOnly
                    className="w-full rounded-xl bg-[#F2EFE9] border border-[#EAE6E1] px-3.5 py-2 text-xs font-medium text-[#777777] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#777777] mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={initialValues.registrationNumber || 'Assigned at Registration'}
                    disabled
                    readOnly
                    className="w-full rounded-xl bg-[#F2EFE9] border border-[#EAE6E1] px-3.5 py-2 text-xs font-medium text-[#777777] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#202020] mb-1.5">
                  Full Name <span className="text-[#E63946]">*</span>
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] px-4 py-2.5 text-sm text-[#202020] outline-none transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#202020] mb-1.5">
                  Department <span className="text-[#E63946]">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="sec-departments-list"
                  minLength={2}
                  maxLength={80}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., AI & Data Science"
                  className="w-full rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] px-4 py-2.5 text-sm text-[#202020] outline-none transition-colors"
                />
                <datalist id="sec-departments-list">
                  {DEPARTMENT_SUGGESTIONS.map((dept) => (
                    <option key={dept} value={dept} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#202020] mb-1.5">
                  Academic Year <span className="text-[#E63946]">*</span>
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] px-4 py-2.5 text-sm text-[#202020] outline-none transition-colors"
                >
                  {ACADEMIC_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#202020] mb-1.5">
                  Semester <span className="text-[#E63946]">*</span>
                </label>
                <select
                  value={currentSemester}
                  onChange={(e) => setCurrentSemester(e.target.value)}
                  className="w-full rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] px-4 py-2.5 text-sm text-[#202020] outline-none transition-colors"
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#202020] mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  maxLength={120}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Saveetha Engineering College, Chennai"
                  className="w-full rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] px-4 py-2.5 text-sm text-[#202020] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#202020] mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  maxLength={24}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g., +91 98765 43210"
                  className="w-full rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] px-4 py-2.5 text-sm text-[#202020] outline-none transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#202020]">
                    Short Biography
                  </label>
                  <span className="text-[11px] text-[#777777] tabular-nums">
                    {bio.length}/600
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={600}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell fellow IDEA LAB innovators what you're building, researching, or excited to collaborate on..."
                  className="w-full rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] px-4 py-2.5 text-sm text-[#202020] outline-none transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#EAE6E1] bg-[#FAF8F5] flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#EAE6E1] text-xs font-semibold text-[#202020] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold shadow-md shadow-[#E63946]/25 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
