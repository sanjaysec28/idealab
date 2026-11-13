import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  Clock,
  Lock,
} from 'lucide-react';
import {
  StudentAvailabilityDoc,
  StudentTimetableDoc,
  TIME_SLOTS,
  WEEKDAYS,
} from '../../types/timetable';
import {
  buildTimetableGridMap,
  calculateTimetableSummary,
  getCellKey,
  hasValidStudentTimetable,
} from '../../utils/timetableCalculations';

interface ReadOnlyWeeklyTimetableProps {
  timetableDoc: StudentTimetableDoc | null;
  availabilityDoc: StudentAvailabilityDoc | null;
  fallbackSemester: string;
  fallbackAcademicYear: string;
  fallbackDepartment: string;
}

function formatTimetableDate(doc: StudentTimetableDoc | null): string | null {
  const ts = doc?.updatedAt || doc?.submittedAt;
  if (!ts || typeof ts.toDate !== 'function') return null;
  try {
    return ts.toDate().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export const ReadOnlyWeeklyTimetable: React.FC<ReadOnlyWeeklyTimetableProps> = ({
  timetableDoc,
  availabilityDoc,
  fallbackSemester,
  fallbackAcademicYear,
  fallbackDepartment,
}) => {
  const hasSavedTimetable = useMemo(
    () => hasValidStudentTimetable({ timetableDoc }),
    [timetableDoc]
  );

  const classes = useMemo(
    () => (hasSavedTimetable && timetableDoc ? timetableDoc.classes : []),
    [hasSavedTimetable, timetableDoc]
  );

  const gridMap = useMemo(() => buildTimetableGridMap(classes), [classes]);
  const summary = useMemo(() => calculateTimetableSummary(classes), [classes]);

  const semesterLabel = timetableDoc?.semester || fallbackSemester || 'Semester 5';
  const academicYearLabel =
    timetableDoc?.academicYear || fallbackAcademicYear || '3rd Year';
  const departmentLabel =
    timetableDoc?.department || fallbackDepartment || 'AI & Data Science';
  const lastUpdatedLabel = formatTimetableDate(timetableDoc);

  const freePeriodsCount =
    availabilityDoc?.totalFreePeriods ?? summary.freePeriods;

  return (
    <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_2px_14px_rgba(32,33,36,0.03)] p-5 sm:p-6 lg:p-7">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EAE6E1]">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-[#202020]">
                My Weekly Timetable
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#FAF8F5] border border-[#EAE6E1] text-[11px] font-semibold text-[#777777]">
                <Lock className="w-3 h-3 text-[#E63946]" />
                <span>Read-Only View</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#777777] mt-1">
              <span className="font-semibold text-[#202020]">{semesterLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{academicYearLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{departmentLabel}</span>
              {lastUpdatedLabel && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-[#777777]">
                    <Clock className="w-3 h-3 text-[#E63946]" />
                    <span>Last updated {lastUpdatedLabel}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/timetable"
            className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#202020] hover:text-[#E63946] inline-flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <CalendarDays className="w-4 h-4 text-[#E63946]" />
            <span>{hasSavedTimetable ? 'Update in Timetable Builder' : 'Open Timetable Builder'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {!hasSavedTimetable ? (
        /* Friendly Empty State when no timetable has been saved yet */
        <div className="mt-6 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-8 sm:p-10 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center mx-auto">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-extrabold text-[#202020]">
              Your timetable isn&apos;t available yet.
            </h3>
            <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
              Build and save your semester schedule in the IDEA LAB Timetable Builder to display your weekly classes and free collaboration periods here.
            </p>
          </div>
          <div className="pt-1">
            <Link
              to="/timetable"
              className="px-5 py-3 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#E63946]/25 inline-flex items-center gap-2 transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Go to Timetable Builder</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Strip */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] px-4 py-3">
              <p className="text-[11px] font-semibold text-[#777777]">Registered Subjects</p>
              <p className="text-xl font-extrabold text-[#202020] mt-0.5 tabular-nums">
                {summary.totalSubjects}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] px-4 py-3">
              <p className="text-[11px] font-semibold text-[#777777]">Active Class Days</p>
              <p className="text-xl font-extrabold text-[#202020] mt-0.5 tabular-nums">
                {summary.classDays} / 6
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] px-4 py-3">
              <p className="text-[11px] font-semibold text-[#777777]">Occupied Periods</p>
              <p className="text-xl font-extrabold text-[#E63946] mt-0.5 tabular-nums">
                {summary.totalClasses}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] px-4 py-3">
              <p className="text-[11px] font-semibold text-[#777777]">Weekly Free Periods</p>
              <p className="text-xl font-extrabold text-[#32B878] mt-0.5 tabular-nums">
                {freePeriodsCount}
              </p>
            </div>
          </div>

          {/* Read-Only Timetable Grid (Horizontally scrollable on small screens) */}
          <div className="mt-5 overflow-x-auto pb-2">
            <div className="min-w-[720px]">
              {/* Weekday Column Headers */}
              <div className="grid grid-cols-[132px_repeat(6,minmax(0,1fr))] gap-2.5 mb-2.5">
                <div className="px-3 py-2.5 rounded-xl bg-[#202020] text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center">
                  Time Slot
                </div>
                {WEEKDAYS.map((day) => (
                  <div
                    key={day.id}
                    className="py-2.5 px-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] text-center"
                  >
                    <span className="text-xs font-extrabold text-[#202020] block">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* 4 Official Time Slot Rows */}
              <div className="space-y-2.5">
                {TIME_SLOTS.map((slot) => (
                  <div
                    key={slot.id}
                    className="grid grid-cols-[132px_repeat(6,minmax(0,1fr))] gap-2.5 items-stretch"
                  >
                    {/* Time Slot Label Cell */}
                    <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] px-3 py-2.5 flex flex-col justify-center">
                      <span className="text-xs font-extrabold text-[#202020] leading-snug tabular-nums">
                        {slot.startTime}
                      </span>
                      <span className="text-[11px] font-medium text-[#777777] leading-snug tabular-nums">
                        to {slot.endTime}
                      </span>
                    </div>

                    {/* Monday - Saturday Read-Only Cells */}
                    {WEEKDAYS.map((day) => {
                      const entry = gridMap[getCellKey(day.id, slot.id)];

                      if (entry) {
                        return (
                          <div
                            key={getCellKey(day.id, slot.id)}
                            title={`${entry.subjectName} (${entry.subjectCode}) — ${entry.facultyName}`}
                            className="min-h-[92px] rounded-2xl p-3 bg-[#E63946] text-white shadow-xs flex flex-col justify-between select-none"
                          >
                            <div className="space-y-1">
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="text-xs font-extrabold tracking-tight leading-tight line-clamp-2">
                                  {entry.subjectName}
                                </span>
                                <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[9px] font-bold tracking-wide uppercase leading-none shrink-0">
                                  {entry.subjectCode}
                                </span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-1">
                              <span className="text-[10px] font-medium text-white/90 truncate">
                                {entry.facultyName}
                              </span>
                              <span className="text-[9px] font-extrabold text-white/80 shrink-0">
                                {entry.subjectAbbreviation}
                              </span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={getCellKey(day.id, slot.id)}
                          className="min-h-[92px] rounded-2xl p-3 bg-[#32B878]/[0.07] border border-[#32B878]/25 flex flex-col items-center justify-center text-center gap-1 select-none"
                        >
                          <span className="text-[11px] font-bold text-[#1F7A4D]">
                            Free Period
                          </span>
                          <span className="text-[10px] text-[#777777] tabular-nums">
                            {slot.startTime} – {slot.endTime}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend & Read-Only Notice */}
          <div className="mt-4 pt-4 border-t border-[#EAE6E1] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-5 text-xs">
              <div className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-[#E63946] inline-block" />
                <span className="font-semibold text-[#202020]">Class (Occupied Slot)</span>
              </div>

              <div className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-[#32B878]/15 border border-[#32B878]/40 inline-block" />
                <span className="font-semibold text-[#202020]">Free Period (Available Slot)</span>
              </div>
            </div>

            <span className="text-[11px] text-[#777777]">
              Schedule is read-only on your profile • Use Timetable Builder to modify classes
            </span>
          </div>
        </>
      )}
    </section>
  );
};
