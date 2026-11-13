import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Mail, ArrowRight, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { calculateTimetableSummary } from '../../utils/timetableCalculations';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'IL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const ProfilePage: React.FC = () => {
  const { user, studentProfile, studentTimetable, studentAvailability, studentData } = useAuth();

  const classes = studentTimetable?.classes ?? [];
  const summary = useMemo(() => calculateTimetableSummary(classes), [classes]);

  const displayName = studentProfile?.fullName || user?.displayName || studentData.name;
  const displayEmail = studentProfile?.email || user?.email || studentData.email;
  const displaySubtitle = [
    studentData.department,
    studentData.year,
    studentData.semester,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-[#EEEEEE] overflow-hidden shadow-sm">
        <div className="h-36 bg-gradient-to-r from-[#E63946] to-[#d62839] relative">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-5 -mt-12 mb-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-[#FFF0F1] border-4 border-white shadow-lg text-[#E63946] font-extrabold text-2xl flex items-center justify-center">
                  {getInitials(displayName)}
                </div>
              )}

              <div className="space-y-1 pb-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#202124]">{displayName}</h1>
                <p className="text-xs text-[#777777]">{displaySubtitle}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EAF8EE] text-[#156D3F] text-xs font-bold rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Email Verified
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FAF8F5] text-[#555555] text-xs font-medium rounded-full border border-[#EAE6E1]">
                    <Mail className="w-3.5 h-3.5" />
                    {displayEmail}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/timetable"
              className="px-4 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold inline-flex items-center gap-2 transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Edit Timetable</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Timetable Summary */}
      <div className="bg-white rounded-3xl border border-[#EEEEEE] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#202124]">Saved Semester Schedule</h2>
            <p className="text-xs text-[#777777]">
              Live summary synced from your submitted timetable.
            </p>
          </div>
          <Link
            to="/timetable"
            className="text-xs font-bold text-[#E63946] hover:underline inline-flex items-center gap-1"
          >
            <span>Open Builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4">
            <p className="text-[11px] font-medium text-[#777777]">Subjects</p>
            <p className="text-xl font-extrabold text-[#202124] mt-0.5">{summary.totalSubjects}</p>
          </div>
          <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4">
            <p className="text-[11px] font-medium text-[#777777]">Weekly Classes</p>
            <p className="text-xl font-extrabold text-[#202124] mt-0.5">{summary.totalClasses}</p>
          </div>
          <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4">
            <p className="text-[11px] font-medium text-[#777777]">Free Periods</p>
            <p className="text-xl font-extrabold text-[#177E48] mt-0.5">
              {studentAvailability?.totalFreePeriods ?? summary.freePeriods}
            </p>
          </div>
          <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4">
            <p className="text-[11px] font-medium text-[#777777]">Collab Sharing</p>
            <p className="text-sm font-bold text-[#202124] mt-1">
              {studentAvailability?.isOptedIn ? 'Opted In' : 'Off'}
            </p>
          </div>
        </div>

        {classes.length > 0 && (
          <div className="space-y-2 pt-2">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="px-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] font-extrabold text-xs flex items-center justify-center shrink-0">
                    {cls.subjectAbbreviation}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#202124] truncate">{cls.subjectName}</p>
                    <p className="text-[11px] text-[#777777] truncate">
                      {cls.subjectCode} • {cls.facultyName}
                    </p>
                  </div>
                </div>
                <BookOpen className="w-4 h-4 text-[#777777] shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
