import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Logo } from '../../components/navigation/Logo';
import { useAuth } from '../../context/AuthContext';

export const SetupProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { studentData, profile, completeAcademicProfile } = useAuth();

  const [rollNumber, setRollNumber] = useState(profile?.rollNumber || studentData.rollNumber || '240005081');
  const [name, setName] = useState(profile?.fullName || studentData.name || 'SanjayKumar B');
  const [department, setDepartment] = useState(profile?.department || studentData.department || 'AI & Data Science');
  const [year, setYear] = useState(profile?.year || studentData.year || '3rd Year');
  const [semester, setSemester] = useState(profile?.semester || '5th Semester');
  const [section, setSection] = useState(profile?.section || 'A');
  const [session, setSession] = useState(profile?.session || '2026 - 2027');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await completeAcademicProfile({
        fullName: name,
        rollNumber,
        department,
        year,
        semester,
        section,
        session,
      });
      navigate('/timetable-setup', { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between p-6 lg:p-12 text-[#202124]">
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
        <Logo size="md" />
      </div>

      <div className="max-w-xl mx-auto w-full bg-white rounded-3xl border border-[#EEEEEE] p-8 lg:p-10 shadow-xl space-y-6 my-8">
        {/* Step indicator matching reference */}
        <div className="flex items-center justify-center gap-6 pb-4 border-b border-[#EEEEEE]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#E63946] text-white text-xs font-bold flex items-center justify-center">1</span>
            <span className="text-xs font-bold text-[#E63946]">Academic</span>
          </div>
          <div className="flex items-center gap-2 opacity-40">
            <span className="w-6 h-6 rounded-full bg-[#EEEEEE] text-[#777777] text-xs font-bold flex items-center justify-center">2</span>
            <span className="text-xs font-semibold text-[#777777]">Interests</span>
          </div>
          <div className="flex items-center gap-2 opacity-40">
            <span className="w-6 h-6 rounded-full bg-[#EEEEEE] text-[#777777] text-xs font-bold flex items-center justify-center">3</span>
            <span className="text-xs font-semibold text-[#777777]">Review</span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-[#202124]">Set Up Your Academic Profile</h1>
          <p className="text-xs text-[#777777]">Let's add your academic details to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-1.5">
              Registration Number <span className="text-[#E63946]">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946]"
              />
              <div className="absolute right-3.5 top-3.5 w-5 h-5 bg-[#32B878]/10 text-[#32B878] rounded-full flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-1.5">
              Full Name <span className="text-[#E63946]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                Department <span className="text-[#E63946]">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946]"
              >
                <option value="AI & Data Science">AI & Data Science</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication Engg">Electronics & Communication Engg</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                Academic Year <span className="text-[#E63946]">*</span>
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946]"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                Current Semester <span className="text-[#E63946]">*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946]"
              >
                <option value="1st Semester">1st Semester</option>
                <option value="3rd Semester">3rd Semester</option>
                <option value="5th Semester">5th Semester</option>
                <option value="7th Semester">7th Semester</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                Section <span className="text-[#E63946]">*</span>
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946]"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202124] mb-1.5">
              Academic Session <span className="text-[#E63946]">*</span>
            </label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-2xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946]"
            >
              <option value="2026 - 2027">2026 - 2027</option>
              <option value="2025 - 2026">2025 - 2026</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-[#E63946] hover:bg-[#d62839] text-white rounded-full text-xs font-bold shadow-lg shadow-[#E63946]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{isSaving ? 'Saving Profile...' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      <div className="max-w-3xl mx-auto w-full text-center text-xs text-[#777777]">
        Saveetha Engineering College • IDEA Lab
      </div>
    </div>
  );
};
