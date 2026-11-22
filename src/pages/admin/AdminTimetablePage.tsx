import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileWarning,
  History,
  Loader2,
  Lock,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import {
  adminLoadStudentRecord,
  AdminLoadedStudentRecord,
  adminSearchStudents,
  adminUpdateStudentTimetable,
} from '../../services/adminTimetableService';
import { DEFAULT_TIMETABLE_ACADEMIC_META } from '../../services/timetableService';
import { StudentProfileDoc } from '../../types/auth';
import {
  ClassFormValues,
  TimeSlotId,
  TimetableAcademicMeta,
  TimetableAuditAction,
  TimetableClassEntry,
  TimetableValidationResult,
  WeekdayId,
} from '../../types/timetable';
import { ACADEMIC_YEARS, DEPARTMENTS, SEMESTERS } from '../../utils/academicConstants';
import {
  buildTimetableGridMap,
  calculateTimetableSummary,
} from '../../utils/timetableCalculations';
import {
  detectTimetableInternalConflicts,
  generateSubjectAbbreviation,
  normalizeSchedule,
  validateClassForm,
} from '../../utils/timetableValidation';
import { HomeHeader } from '../../components/home/HomeHeader';
import { AddClassPanel } from '../../components/timetable/AddClassPanel';
import { WeeklyTimetable } from '../../components/timetable/WeeklyTimetable';
import { MyClassesPanel } from '../../components/timetable/MyClassesPanel';
import { TimetableSummary } from '../../components/timetable/TimetableSummary';

const EMPTY_FORM: ClassFormValues = {
  subjectCode: '',
  subjectName: '',
  facultyName: '',
  selectedDays: [],
  scheduleByDay: {},
};

function formatAuditTimestamp(ts: { toDate?: () => Date } | undefined): string {
  if (!ts || typeof ts.toDate !== 'function') return 'Just now';
  try {
    return ts.toDate().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Timestamp unavailable';
  }
}

function getAuditActionBadge(action: TimetableAuditAction): {
  label: string;
  classes: string;
} {
  switch (action) {
    case 'admin_correction':
      return {
        label: 'Admin Correction',
        classes: 'bg-[#FFF0F1] text-[#E63946] border-[#E63946]/25',
      };
    case 'timetable_finalized':
      return {
        label: 'Finalized & Locked',
        classes: 'bg-[#EAF8EE] text-[#177E48] border-[#C9EED5]',
      };
    case 'timetable_created':
      return {
        label: 'Draft Created (1/1)',
        classes: 'bg-[#FFF8EB] text-[#B45309] border-[#F3DFB6]',
      };
    case 'timetable_updated_in_review':
      return {
        label: 'Draft Updated',
        classes: 'bg-[#FAF8F5] text-[#202020] border-[#EAE6E1]',
      };
    case 'warning_acknowledged':
    default:
      return {
        label: 'Warning Accepted',
        classes: 'bg-[#FAF8F5] text-[#5F6368] border-[#EAE6E1]',
      };
  }
}

export const AdminTimetablePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<StudentProfileDoc[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<AdminLoadedStudentRecord | null>(null);

  const [classes, setClasses] = useState<TimetableClassEntry[]>([]);
  const [academicMeta, setAcademicMeta] = useState<TimetableAcademicMeta>(
    DEFAULT_TIMETABLE_ACADEMIC_META
  );
  const [formValues, setFormValues] = useState<ClassFormValues>(EMPTY_FORM);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<WeekdayId[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    TimetableValidationResult['errors'] | null
  >(null);

  const [correctionReason, setCorrectionReason] = useState('');
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const gridMap = useMemo(() => buildTimetableGridMap(classes), [classes]);
  const summary = useMemo(() => calculateTimetableSummary(classes), [classes]);
  const internalConflicts = useMemo(
    () => detectTimetableInternalConflicts(classes),
    [classes]
  );

  const resetClassForm = () => {
    setFormValues(EMPTY_FORM);
    setEditingClassId(null);
    setExpandedDays([]);
    setValidationErrors(null);
  };

  const hydrateFromRecord = (record: AdminLoadedStudentRecord) => {
    setSelectedRecord(record);
    setClasses(record.timetable?.classes ? [...record.timetable.classes] : []);
    setAcademicMeta({
      department:
        record.timetable?.department ||
        record.profile.department ||
        DEFAULT_TIMETABLE_ACADEMIC_META.department,
      academicYear:
        record.timetable?.academicYear ||
        record.profile.currentAcademicYear ||
        record.profile.academicYear ||
        DEFAULT_TIMETABLE_ACADEMIC_META.academicYear,
      semester:
        record.timetable?.semester ||
        record.profile.currentSemester ||
        DEFAULT_TIMETABLE_ACADEMIC_META.semester,
    });
    resetClassForm();
    setCorrectionReason('');
    setSaveError(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchError('Enter a registration number, email address, or student name.');
      return;
    }

    setSearchError(null);
    setRecordError(null);
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await adminSearchStudents(trimmed);
      setSearchResults(results);
      if (results.length === 1) {
        await handleSelectStudent(results[0].uid);
      }
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : 'Unable to search student records.'
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectStudent = async (studentUid: string) => {
    setIsLoadingRecord(true);
    setRecordError(null);
    setSaveSuccess(null);
    setSaveError(null);
    try {
      const record = await adminLoadStudentRecord(studentUid);
      hydrateFromRecord(record);
    } catch (err) {
      setRecordError(
        err instanceof Error ? err.message : 'Unable to load student timetable record.'
      );
    } finally {
      setIsLoadingRecord(false);
    }
  };

  const handleFieldChange = (
    field: 'subjectCode' | 'subjectName' | 'facultyName',
    value: string
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (validationErrors) {
      setValidationErrors((prev) =>
        prev ? { ...prev, [field]: undefined, duplicate: undefined } : null
      );
    }
  };

  const handleToggleDay = (day: WeekdayId) => {
    setFormValues((prev) => {
      const exists = prev.selectedDays.includes(day);
      if (exists) {
        const nextSchedule = { ...prev.scheduleByDay };
        delete nextSchedule[day];
        return {
          ...prev,
          selectedDays: prev.selectedDays.filter((d) => d !== day),
          scheduleByDay: nextSchedule,
        };
      }
      return {
        ...prev,
        selectedDays: [...prev.selectedDays, day],
      };
    });

    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

    if (validationErrors) {
      setValidationErrors((prev) =>
        prev ? { ...prev, days: undefined, slots: undefined, conflict: undefined } : null
      );
    }
  };

  const handleToggleExpandDay = (day: WeekdayId) => {
    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleToggleSlot = (day: WeekdayId, slotId: TimeSlotId) => {
    setFormValues((prev) => {
      const currentSlots = prev.scheduleByDay[day] ?? [];
      const nextSlots = currentSlots.includes(slotId)
        ? currentSlots.filter((id) => id !== slotId)
        : [...currentSlots, slotId];

      const nextSelectedDays = prev.selectedDays.includes(day)
        ? prev.selectedDays
        : [...prev.selectedDays, day];

      return {
        ...prev,
        selectedDays: nextSelectedDays,
        scheduleByDay: {
          ...prev.scheduleByDay,
          [day]: nextSlots,
        },
      };
    });

    if (!expandedDays.includes(day)) {
      setExpandedDays((prev) => [...prev, day]);
    }

    if (validationErrors) {
      setValidationErrors((prev) =>
        prev ? { ...prev, slots: undefined, conflict: undefined } : null
      );
    }
  };

  const handleEditClass = (entry: TimetableClassEntry) => {
    setEditingClassId(entry.id);
    setFormValues({
      subjectCode: entry.subjectCode,
      subjectName: entry.subjectName,
      facultyName: entry.facultyName,
      selectedDays: [...entry.days],
      scheduleByDay: Object.fromEntries(
        Object.entries(entry.scheduleByDay).map(([day, slots]) => [day, [...(slots ?? [])]])
      ),
    });
    setExpandedDays([...entry.days]);
    setValidationErrors(null);
  };

  const handleDeleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((cls) => cls.id !== classId));
    if (editingClassId === classId) {
      resetClassForm();
    }
    setSaveError(null);
    setSaveSuccess(null);
  };

  const handleAddOrUpdateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateClassForm(formValues, classes, editingClassId);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    const { days, scheduleByDay } = normalizeSchedule(
      formValues.selectedDays,
      formValues.scheduleByDay
    );
    const cleanCode = formValues.subjectCode.trim().toUpperCase();
    const cleanName = formValues.subjectName.trim();
    const cleanFaculty = formValues.facultyName.trim();
    const abbr = generateSubjectAbbreviation(cleanName, cleanCode);
    const timestamp = new Date().toISOString();

    if (editingClassId) {
      setClasses((prev) =>
        prev.map((cls) =>
          cls.id === editingClassId
            ? {
                ...cls,
                subjectCode: cleanCode,
                subjectName: cleanName,
                subjectAbbreviation: abbr,
                facultyName: cleanFaculty,
                days,
                scheduleByDay,
                updatedAt: timestamp,
              }
            : cls
        )
      );
    } else {
      const newEntry: TimetableClassEntry = {
        id: `cls-${cleanCode}-${Date.now().toString(36)}`,
        subjectCode: cleanCode,
        subjectName: cleanName,
        subjectAbbreviation: abbr,
        facultyName: cleanFaculty,
        days,
        scheduleByDay,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setClasses((prev) => [...prev, newEntry]);
    }

    setSaveError(null);
    setSaveSuccess(null);
    resetClassForm();
  };

  const handleSaveCorrection = async () => {
    if (!selectedRecord || isSavingCorrection) return;

    setSaveError(null);
    setSaveSuccess(null);

    if (classes.length === 0) {
      setSaveError('Student timetable must include at least one scheduled class.');
      return;
    }
    if (internalConflicts.length > 0) {
      setSaveError('Resolve all schedule conflicts before saving admin corrections.');
      return;
    }
    if (correctionReason.trim().length < 5) {
      setSaveError(
        'Enter a clear correction reason (minimum 5 characters) for the audit log.'
      );
      return;
    }

    setIsSavingCorrection(true);
    try {
      await adminUpdateStudentTimetable({
        studentUid: selectedRecord.profile.uid,
        classes,
        academicMeta,
        reason: correctionReason,
      });

      const refreshed = await adminLoadStudentRecord(selectedRecord.profile.uid);
      hydrateFromRecord(refreshed);
      setSaveSuccess(
        `Saved correction for ${refreshed.profile.fullName} (v${refreshed.timetable?.version ?? 1}) and recorded immutable audit log.`
      );
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Unable to save admin timetable correction.'
      );
    } finally {
      setIsSavingCorrection(false);
    }
  };

  const selectedProfile = selectedRecord?.profile;
  const workflowState = selectedProfile?.timetableWorkflowState ?? 'not_started';
  const isLocked = Boolean(
    selectedProfile?.timetableLocked ||
      selectedRecord?.timetable?.isLocked ||
      workflowState === 'finalized'
  );

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-[#202124] flex flex-col">
      <HomeHeader />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-20 space-y-5">
        {/* Top Admin Banner */}
        <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#202124]">
                  Admin Timetable Corrections
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0F1] border border-[#E63946]/20 text-[11px] font-bold text-[#E63946]">
                  Audited Access
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5F6368] mt-1">
                Look up any student by registration number, email, or name to inspect or update locked timetables with a mandatory audit trail.
              </p>
            </div>
          </div>

          <Link
            to="/home"
            className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#EAE6E1] text-xs font-bold text-[#202124] inline-flex items-center gap-2 shrink-0 w-fit transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </section>

        {/* Student Search Panel */}
        <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-xs p-5 sm:p-6 space-y-4">
          <form
            onSubmit={(e) => void handleSearch(e)}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#777777] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Registration Number (e.g., 212222230045), Email, or Full Name..."
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] text-sm text-[#202124] outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="h-11 px-6 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#E63946]/25 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60 shrink-0"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Find Student</span>
                </>
              )}
            </button>
          </form>

          {searchError && (
            <div
              role="alert"
              className="rounded-xl bg-[#FFF0F1] border border-[#E63946]/25 px-4 py-3 text-xs font-medium text-[#E63946] flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {hasSearched && !isSearching && searchResults.length === 0 && !searchError && (
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-5 text-center text-xs text-[#5F6368]">
              No matching student found. Try entering the exact uppercase Registration Number or verified Google email address.
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map((student) => {
                const isSelected = selectedProfile?.uid === student.uid;
                const locked = Boolean(
                  student.timetableLocked || student.timetableWorkflowState === 'finalized'
                );
                return (
                  <button
                    key={student.uid}
                    type="button"
                    onClick={() => void handleSelectStudent(student.uid)}
                    className={`text-left rounded-2xl border p-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF0F1]/70 border-[#E63946] shadow-xs'
                        : 'bg-[#FAF8F5] hover:bg-white border-[#EAE6E1]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[#202124] truncate">
                          {student.fullName}
                        </p>
                        <p className="text-[11px] font-mono text-[#5F6368] truncate mt-0.5">
                          {student.registrationNumber || 'No Reg No'}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                          locked
                            ? 'bg-[#EAF8EE] text-[#177E48]'
                            : 'bg-white border border-[#EAE6E1] text-[#777777]'
                        }`}
                      >
                        {locked ? 'Locked' : student.timetableWorkflowState || 'Pending'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777777] truncate mt-1.5">
                      {student.email}
                    </p>
                    <p className="text-[11px] text-[#5F6368] truncate mt-0.5">
                      {[student.degree, student.department].filter(Boolean).join(' · ')}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {isLoadingRecord && (
          <div className="bg-white rounded-[24px] border border-[#EAE6E1] p-10 flex items-center justify-center gap-3 text-sm font-semibold text-[#5F6368]">
            <Loader2 className="w-5 h-5 animate-spin text-[#E63946]" />
            <span>Loading student profile, timetable, and audit logs...</span>
          </div>
        )}

        {recordError && (
          <div
            role="alert"
            className="rounded-2xl bg-[#FFF0F1] border border-[#E63946]/30 p-4 flex items-center gap-2.5 text-xs font-semibold text-[#E63946]"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{recordError}</span>
          </div>
        )}

        {/* Selected Student Record + Editor + Audit History */}
        {!isLoadingRecord && selectedRecord && selectedProfile && (
          <div className="space-y-5">
            {/* Selected Student Overview */}
            <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-xs p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] text-[#E63946] flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base sm:text-lg font-extrabold text-[#202124]">
                        {selectedProfile.fullName}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isLocked
                            ? 'bg-[#EAF8EE] text-[#177E48] border-[#C9EED5]'
                            : 'bg-[#FFF8EB] text-[#B45309] border-[#F3DFB6]'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>
                          {isLocked
                            ? 'Finalized & Student-Locked'
                            : workflowState === 'in_review'
                              ? 'In Student Review'
                              : 'Not Submitted'}
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5F6368]">
                      <span className="font-mono font-bold text-[#202124]">
                        {selectedProfile.registrationNumber || 'Unassigned'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{selectedProfile.email}</span>
                      {selectedProfile.degree && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{selectedProfile.degree}</span>
                        </>
                      )}
                      {selectedProfile.department && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{selectedProfile.department}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#5F6368]">
                  <span className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] font-semibold text-[#202124]">
                    Version: v{selectedRecord.timetable?.version ?? 0}
                  </span>
                  {selectedRecord.timetable?.lastEditedByRole && (
                    <span className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] font-semibold">
                      Last edited by: {selectedRecord.timetable.lastEditedByRole}
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Feedback Banners */}
            {saveSuccess && (
              <div
                role="status"
                className="rounded-2xl bg-[#EAF8EE] border border-[#C9EED5] p-4 flex items-center gap-2.5 text-xs font-bold text-[#177E48]"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {saveError && (
              <div
                role="alert"
                className="rounded-2xl bg-[#FFF0F1] border border-[#E63946]/30 p-4 flex items-center gap-2.5 text-xs font-bold text-[#E63946]"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Embedded Timetable Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(285px,28fr)_minmax(0,46fr)_minmax(265px,26fr)] gap-5 items-start">
              <AddClassPanel
                formValues={formValues}
                editingClassId={editingClassId}
                expandedDays={expandedDays}
                gridMap={gridMap}
                validationErrors={validationErrors}
                onFieldChange={handleFieldChange}
                onToggleDay={handleToggleDay}
                onToggleExpandDay={handleToggleExpandDay}
                onToggleSlot={handleToggleSlot}
                onClear={resetClassForm}
                onFinalize={handleAddOrUpdateClass}
              />

              <WeeklyTimetable
                gridMap={gridMap}
                formScheduleByDay={formValues.scheduleByDay}
                formSelectedDays={formValues.selectedDays}
                editingClassId={editingClassId}
                summary={summary}
                onSelectEmptyCell={(day, slotId) => handleToggleSlot(day, slotId)}
                onSelectOccupiedCell={handleEditClass}
                onResetView={resetClassForm}
              />

              <div className="space-y-5">
                <MyClassesPanel
                  classes={classes}
                  editingClassId={editingClassId}
                  onEditClass={handleEditClass}
                  onDeleteClass={handleDeleteClass}
                />

                <TimetableSummary summary={summary} />

                {/* Admin Correction Save + Audit Reason Card */}
                <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#EAE6E1]">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-[#E63946]" />
                      <h2 className="text-sm font-bold text-[#202124]">
                        Save Audited Correction
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="admin-dept"
                        className="block text-[11px] font-bold text-[#5F6368] mb-1"
                      >
                        Department
                      </label>
                      <select
                        id="admin-dept"
                        value={academicMeta.department}
                        onChange={(e) =>
                          setAcademicMeta((prev) => ({
                            ...prev,
                            department: e.target.value,
                          }))
                        }
                        className="w-full h-9.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] px-3 text-xs font-medium text-[#202124] focus:outline-none focus:border-[#E63946]"
                      >
                        {!DEPARTMENTS.includes(
                          academicMeta.department as (typeof DEPARTMENTS)[number]
                        ) && (
                          <option value={academicMeta.department}>
                            {academicMeta.department}
                          </option>
                        )}
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label
                          htmlFor="admin-year"
                          className="block text-[11px] font-bold text-[#5F6368] mb-1"
                        >
                          Academic Year
                        </label>
                        <select
                          id="admin-year"
                          value={academicMeta.academicYear}
                          onChange={(e) =>
                            setAcademicMeta((prev) => ({
                              ...prev,
                              academicYear: e.target.value,
                            }))
                          }
                          className="w-full h-9.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] px-2.5 text-xs font-medium text-[#202124] focus:outline-none focus:border-[#E63946]"
                        >
                          {ACADEMIC_YEARS.map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="admin-semester"
                          className="block text-[11px] font-bold text-[#5F6368] mb-1"
                        >
                          Semester
                        </label>
                        <select
                          id="admin-semester"
                          value={academicMeta.semester}
                          onChange={(e) =>
                            setAcademicMeta((prev) => ({
                              ...prev,
                              semester: e.target.value,
                            }))
                          }
                          className="w-full h-9.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] px-2.5 text-xs font-medium text-[#202124] focus:outline-none focus:border-[#E63946]"
                        >
                          {SEMESTERS.map((sem) => (
                            <option key={sem} value={sem}>
                              {sem}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="admin-correction-reason"
                          className="block text-[11px] font-bold text-[#202124]"
                        >
                          Correction Reason (required for audit log){' '}
                          <span className="text-[#E63946]">*</span>
                        </label>
                        <span className="text-[10px] text-[#777777] tabular-nums">
                          {correctionReason.length}/500
                        </span>
                      </div>
                      <textarea
                        id="admin-correction-reason"
                        rows={3}
                        maxLength={500}
                        value={correctionReason}
                        onChange={(e) => setCorrectionReason(e.target.value)}
                        placeholder="e.g., Updated elective lab slot per HoD approval memo."
                        className="w-full rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] p-3 text-xs text-[#202124] outline-none resize-none transition-colors"
                      />
                    </div>
                  </div>

                  {internalConflicts.length > 0 && (
                    <div className="rounded-xl bg-[#FFF0F1] border border-[#E63946]/25 p-2.5 flex items-start gap-2 text-[11px] text-[#E63946] font-medium">
                      <FileWarning className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        Resolve {internalConflicts.length} timetable conflict(s) before saving.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      type="button"
                      disabled={
                        isSavingCorrection ||
                        classes.length === 0 ||
                        internalConflicts.length > 0
                      }
                      onClick={() => void handleSaveCorrection()}
                      className="w-full h-11 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold shadow-md shadow-[#E63946]/20 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingCorrection ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Audited Correction...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Admin Correction</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isSavingCorrection}
                      onClick={() => hydrateFromRecord(selectedRecord)}
                      className="w-full h-9.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#EAE6E1] text-xs font-semibold text-[#5F6368] hover:text-[#202124] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Unsaved Edits</span>
                    </button>
                  </div>
                </section>
              </div>
            </div>

            {/* Immutable Audit Log History */}
            <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#EAE6E1]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] text-[#E63946] flex items-center justify-center">
                    <History className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-[#202124]">
                      Immutable Timetable Audit Log
                    </h2>
                    <p className="text-xs text-[#777777]">
                      Every warning acceptance, draft submission, permanent lock, and admin correction is preserved here.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#5F6368] tabular-nums">
                  {selectedRecord.auditLogs.length} entries
                </span>
              </div>

              {selectedRecord.auditLogs.length === 0 ? (
                <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-6 text-center text-xs text-[#777777]">
                  No timetable audit log entries recorded for this student yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedRecord.auditLogs.map((log) => {
                    const badge = getAuditActionBadge(log.action);
                    return (
                      <article
                        key={log.id}
                        className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.classes}`}
                            >
                              {badge.label}
                            </span>
                            {typeof log.previousVersion === 'number' &&
                              typeof log.newVersion === 'number' && (
                                <span className="text-[11px] font-mono font-bold text-[#202124]">
                                  v{log.previousVersion} → v{log.newVersion}
                                </span>
                              )}
                            <span className="text-[11px] text-[#5F6368]">
                              Actor: <strong>{log.actorEmail || log.actorUid}</strong> ({log.actorRole})
                            </span>
                          </div>

                          {log.reason && (
                            <p className="text-xs text-[#202124] leading-relaxed">
                              <span className="font-semibold text-[#5F6368]">Reason:</span>{' '}
                              {log.reason}
                            </p>
                          )}
                        </div>

                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#777777] shrink-0 tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-[#E63946]" />
                          <span>{formatAuditTimestamp(log.timestamp)}</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};
