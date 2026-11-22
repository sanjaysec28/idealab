import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Home, Info, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  acknowledgeTimetableWarning,
  clearTimetableDraft,
  createOrUpdateReviewTimetable,
  DEFAULT_TIMETABLE_ACADEMIC_META,
  finalizeTimetable,
  loadTimetableDraft,
  saveTimetableDraft,
} from '../../services/timetableService';
import {
  ClassFormValues,
  TimeSlotId,
  TimetableAcademicMeta,
  TimetableClassEntry,
  TimetableValidationResult,
  WeekdayId,
} from '../../types/timetable';
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
import { TimetableHeader } from '../../components/timetable/TimetableHeader';
import { TimetableWarningCard } from '../../components/timetable/TimetableWarningCard';
import { AddClassPanel } from '../../components/timetable/AddClassPanel';
import { WeeklyTimetable } from '../../components/timetable/WeeklyTimetable';
import { MyClassesPanel } from '../../components/timetable/MyClassesPanel';
import { TimetableSummary } from '../../components/timetable/TimetableSummary';
import { SubmitTimetableCard } from '../../components/timetable/SubmitTimetableCard';
import { ReadOnlyWeeklyTimetable } from '../../components/profile/ReadOnlyWeeklyTimetable';

const EMPTY_FORM: ClassFormValues = {
  subjectCode: '',
  subjectName: '',
  facultyName: '',
  selectedDays: [],
  scheduleByDay: {},
};

export const TimetablePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    studentProfile,
    studentTimetable,
    studentAvailability,
    isTimetableLocked,
    refreshStudentData,
  } = useAuth();
  const uid = user?.uid || '';

  const [classes, setClasses] = useState<TimetableClassEntry[]>([]);
  const [formValues, setFormValues] = useState<ClassFormValues>(EMPTY_FORM);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<WeekdayId[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    TimetableValidationResult['errors'] | null
  >(null);

  const [isDirtySinceSave, setIsDirtySinceSave] = useState(false);
  const [isAcknowledgingWarning, setIsAcknowledgingWarning] = useState(false);
  const [warningError, setWarningError] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftSavedNotice, setDraftSavedNotice] = useState<string | null>(null);
  const hydratedUidRef = useRef<string | null>(null);

  const isInReview = Boolean(
    !isTimetableLocked &&
      (studentTimetable?.submissionStatus === 'in_review' ||
        studentProfile?.timetableWorkflowState === 'in_review')
  );
  const needsWarning = Boolean(
    !isTimetableLocked && !isInReview && !studentProfile?.timetableWarningAcceptedAt
  );

  // Hydrate initial timetable cleanly
  useEffect(() => {
    if (!uid) return;
    if (isTimetableLocked) {
      if (studentTimetable?.classes) {
        setClasses(studentTimetable.classes);
      }
      setIsDirtySinceSave(false);
      hydratedUidRef.current = uid;
      return;
    }

    if (hydratedUidRef.current === uid && isDirtySinceSave) {
      return;
    }

    const draft = loadTimetableDraft(uid);
    if (draft.classes.length > 0) {
      setClasses(draft.classes);
      setIsDirtySinceSave(true);
    } else if (studentTimetable?.classes && studentTimetable.classes.length > 0) {
      setClasses(studentTimetable.classes);
      setIsDirtySinceSave(false);
    } else if (hydratedUidRef.current !== uid) {
      setClasses([]);
      setIsDirtySinceSave(false);
    }

    hydratedUidRef.current = uid;
  }, [uid, studentTimetable, isDirtySinceSave, isTimetableLocked]);

  const initialAcademicMeta: TimetableAcademicMeta = useMemo(
    () => ({
      department:
        studentTimetable?.department ||
        studentProfile?.department ||
        DEFAULT_TIMETABLE_ACADEMIC_META.department,
      academicYear:
        studentTimetable?.academicYear ||
        studentProfile?.currentAcademicYear ||
        studentProfile?.academicYear ||
        DEFAULT_TIMETABLE_ACADEMIC_META.academicYear,
      semester:
        studentTimetable?.semester ||
        studentProfile?.currentSemester ||
        DEFAULT_TIMETABLE_ACADEMIC_META.semester,
    }),
    [studentProfile, studentTimetable]
  );

  const persistLocalDraft = (nextClasses: TimetableClassEntry[]) => {
    if (isTimetableLocked) return;
    setClasses(nextClasses);
    setIsDirtySinceSave(true);
    setSubmitError(null);
    setDraftSavedNotice(null);
    if (uid) {
      saveTimetableDraft(uid, nextClasses);
    }
  };

  const gridMap = useMemo(() => buildTimetableGridMap(classes), [classes]);
  const summary = useMemo(() => calculateTimetableSummary(classes), [classes]);
  const internalConflicts = useMemo(
    () => detectTimetableInternalConflicts(classes),
    [classes]
  );

  const resetForm = () => {
    setFormValues(EMPTY_FORM);
    setEditingClassId(null);
    setExpandedDays([]);
    setValidationErrors(null);
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

  const handleSelectEmptyCell = (day: WeekdayId, slotId: TimeSlotId) => {
    if (isTimetableLocked) return;
    handleToggleSlot(day, slotId);
  };

  const handleEditClass = (entry: TimetableClassEntry) => {
    if (isTimetableLocked) return;
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
    if (isTimetableLocked) return;
    const nextClasses = classes.filter((cls) => cls.id !== classId);
    if (editingClassId === classId) {
      resetForm();
    }
    persistLocalDraft(nextClasses);
  };

  const handleAddOrUpdateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTimetableLocked) return;

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
      const nextClasses = classes.map((cls) =>
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
      );
      persistLocalDraft(nextClasses);
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
      persistLocalDraft([...classes, newEntry]);
    }

    resetForm();
  };

  const handleResetUnsavedEdits = () => {
    if (isTimetableLocked) return;
    resetForm();
    if (uid) {
      clearTimetableDraft(uid);
    }
    setClasses(studentTimetable?.classes ?? []);
    setIsDirtySinceSave(false);
    setSubmitError(null);
    setDraftSavedNotice(null);
  };

  const handleAcknowledgeWarning = async () => {
    if (!uid || isAcknowledgingWarning) return;
    setWarningError(null);
    setIsAcknowledgingWarning(true);
    try {
      await acknowledgeTimetableWarning(uid);
      await refreshStudentData();
    } catch (err) {
      setWarningError(
        err instanceof Error ? err.message : 'Unable to save confirmation. Please retry.'
      );
    } finally {
      setIsAcknowledgingWarning(false);
    }
  };

  const handleSaveDraft = async (academicMeta: TimetableAcademicMeta) => {
    if (isSavingDraft || isTimetableLocked) return;
    setIsSavingDraft(true);
    setSubmitError(null);
    setDraftSavedNotice(null);
    try {
      await createOrUpdateReviewTimetable({
        classes,
        academicMeta,
      });
      setIsDirtySinceSave(false);
      await refreshStudentData();
      setDraftSavedNotice(
        'Draft saved to Review Mode. Verify all periods carefully, then click "Final Confirm & Lock" when ready.'
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to save your timetable draft. Please retry.';
      setSubmitError(message);
      throw err;
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleConfirmFinalize = async (academicMeta: TimetableAcademicMeta) => {
    if (isFinalizing || isTimetableLocked) return;
    setIsFinalizing(true);
    setSubmitError(null);
    try {
      await finalizeTimetable({
        classes,
        academicMeta,
      });
      setIsDirtySinceSave(false);
      await refreshStudentData();
      navigate('/home', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to finalize your timetable. Please retry.';
      setSubmitError(message);
      throw err;
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-[#202124] flex flex-col">
      <TimetableHeader
        isLocked={isTimetableLocked}
        isInReview={isInReview}
        hasClasses={classes.length > 0}
        onResetUnsavedEdits={handleResetUnsavedEdits}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {isTimetableLocked ? (
          /* LOCKED READ-ONLY VIEW AFTER FINAL CONFIRMATION */
          <div className="space-y-5">
            <div className="rounded-[24px] bg-white border border-[#EAE6E1] shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#32B878]/12 text-[#1F7A4D] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-extrabold text-[#202124]">
                    Timetable Finalized &amp; Permanently Locked
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5F6368] leading-relaxed">
                    Your semester schedule is locked and synced to your IDEA LAB profile. If any future correction is required, contact an IDEA LAB Admin.
                  </p>
                </div>
              </div>

              <Link
                to="/home"
                className="px-5 py-2.5 rounded-full bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold shadow-md shadow-[#E63946]/20 inline-flex items-center justify-center gap-2 shrink-0 whitespace-nowrap transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <ReadOnlyWeeklyTimetable
              timetableDoc={studentTimetable}
              availabilityDoc={studentAvailability}
              fallbackSemester={initialAcademicMeta.semester}
              fallbackAcademicYear={initialAcademicMeta.academicYear}
              fallbackDepartment={initialAcademicMeta.department}
              hideBuilderLink
            />
          </div>
        ) : needsWarning ? (
          /* STAGE A: ONE-TIME WARNING CARD */
          <TimetableWarningCard
            isSubmitting={isAcknowledgingWarning}
            error={warningError}
            onAcknowledge={handleAcknowledgeWarning}
          />
        ) : (
          /* STAGE B & C: TIMETABLE BUILDER + DRAFT REVIEW + FINAL LOCK */
          <div className="space-y-4">
            <div
              className={`rounded-2xl border px-4 py-3 flex items-start gap-2.5 text-xs ${
                isInReview
                  ? 'bg-[#FFF8EB] border-[#F3DFB6] text-[#92400E]'
                  : 'bg-white border-[#EAE6E1] text-[#202124]'
              }`}
            >
              {isInReview ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#B45309]" />
              ) : (
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#E63946]" />
              )}
              <div className="leading-relaxed">
                {draftSavedNotice ? (
                  <span className="font-semibold">{draftSavedNotice}</span>
                ) : isInReview ? (
                  <span>
                    <strong>Review Mode (Attempt 1/1 used):</strong> Inspect your classes below and make any edits you need. Once you click <strong>Final Confirm &amp; Lock</strong>, your timetable will be permanently locked.
                  </span>
                ) : (
                  <span>
                    <strong>Create Timetable (Attempt 1 of 1):</strong> Add all your subjects below, then click <strong>Save Draft &amp; Review Timetable</strong> before permanent finalization.
                  </span>
                )}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-[minmax(285px,28fr)_minmax(0,46fr)_minmax(265px,26fr)] gap-5 items-start"
            >
              {/* LEFT PANEL (28%): Add New Class */}
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
                onClear={resetForm}
                onFinalize={handleAddOrUpdateClass}
              />

              {/* CENTRE PANEL (46%): My Weekly Timetable */}
              <WeeklyTimetable
                gridMap={gridMap}
                formScheduleByDay={formValues.scheduleByDay}
                formSelectedDays={formValues.selectedDays}
                editingClassId={editingClassId}
                summary={summary}
                onSelectEmptyCell={handleSelectEmptyCell}
                onSelectOccupiedCell={handleEditClass}
                onResetView={resetForm}
              />

              {/* RIGHT PANEL (26%): My Classes + Timetable Summary + Save/Lock */}
              <div className="space-y-5">
                <MyClassesPanel
                  classes={classes}
                  editingClassId={editingClassId}
                  onEditClass={handleEditClass}
                  onDeleteClass={handleDeleteClass}
                />

                <TimetableSummary summary={summary} />

                <SubmitTimetableCard
                  classes={classes}
                  summary={summary}
                  hasConflicts={internalConflicts.length > 0}
                  savedTimetable={studentTimetable}
                  initialAcademicMeta={initialAcademicMeta}
                  isDirtySinceSave={isDirtySinceSave}
                  isSavingDraft={isSavingDraft}
                  isFinalizing={isFinalizing}
                  submitError={submitError}
                  onSaveDraft={handleSaveDraft}
                  onFinalize={handleConfirmFinalize}
                />
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};
