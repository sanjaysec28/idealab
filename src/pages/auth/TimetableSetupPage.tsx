import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Logo } from '../../components/navigation/Logo';
import { useAuth } from '../../context/AuthContext';

export const TimetableSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { completeTimetableSetup, studentData } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await completeTimetableSetup(24);
      navigate('/discover', { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between p-6 lg:p-12 text-[#202124]">
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <Logo size="md" />
        <div className="text-xs font-bold text-[#E63946] bg-[#FFF0F1] px-3.5 py-1.5 rounded-full border border-[#E63946]/20">
          Step 2 of 2: Timetable Setup
        </div>
      </div>

      <div className="max-w-lg mx-auto w-full bg-white rounded-3xl border border-[#EEEEEE] p-8 lg:p-10 shadow-xl space-y-6 text-center">
        <div className="w-20 h-20 bg-[#FFF0F1] text-[#E63946] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Calendar className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-[#202124]">Timetable & Schedule Synchronization</h1>
          <p className="text-xs lg:text-sm text-[#777777] leading-relaxed">
            Sync your Saveetha class timetable to unlock IDEA Lab lab-slot availability and enter your student workspace.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#EEEEEE] text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-[#32B878] font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Academic Profile Saved Successfully</span>
          </div>
          <p className="text-[#777777]">
            {studentData.name} • {studentData.department} ({studentData.year})
          </p>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={handleComplete}
          className="w-full py-3.5 bg-[#E63946] hover:bg-[#d62839] text-white rounded-2xl text-xs font-bold shadow-lg shadow-[#E63946]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <span>{isSaving ? 'Completing Setup...' : 'Enter IDEA Lab Dashboard'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full text-center text-xs text-[#777777]">
        Saveetha Engineering College • IDEA Lab Student Ecosystem
      </div>
    </div>
  );
};
