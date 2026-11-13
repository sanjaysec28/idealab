import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import {
  clearTimetableDraft,
  DEFAULT_TIMETABLE_ACADEMIC_META,
  loadTimetableDraft,
  saveTimetableDraft,
  submitFinalTimetableToFirestore,
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
import { AddClassPanel } from '../../components/timetable/AddClassPanel';
import { WeeklyTimetable } from '../../components/timetable/WeeklyTimetable';
import { MyClassesPanel } from '../../components/timetable/MyClassesPanel';
import { TimetableSummary } from '../../components/timetable/TimetableSummary';
import { SubmitTimetableCard } from '../../components/timetable/SubmitTimetableCard';

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
    studentData,
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

  const [isDirtySinceSubmit, setIsDirtySinceSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hydratedUidRef = useRef<string | null>(null);

  // Hydrate initial timetable: prefer persisted Firestore timetable if submitted;
  // otherwise load local unsaved draft (which starts empty for new students).
  useEffect(() => {
    if (!uid) return;
    if (hydratedUidRef.current === uid && isDirtySinceSubmit) {
      return;
    }

    const draft = loadTimetableDraft(uid);
    if (draft.classes.length > 0) {
      setClasses(draft.classes);
      setIsDirtySinceSubmit(true);
    } else if (studentTimetable?.classes && studentTimetable.classes.length > 0) {
      setClasses(studentTimetable.classes);
      setIsDirtySinceSubmit(false);
    } else if (hydratedUidRef.current !== uid) {
      setClasses([]);
      setIsDirtySinceSubmit(false);
    }

    hydratedUidRef.current = uid;
  }, [uid, studentTimetable, isDirtySinceSubmit]);

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
    setClasses(nextClasses);
    setIsDirtySinceSubmit(true);
    setSubmitError(null);
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
    handleToggleSlot(day, slotId);
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
    const nextClasses = classes.filter((cls) => cls.id !== classId);
    if (editingClassId === classId) {
      resetForm();
    }
    persistLocalDraft(nextClasses);
  };

  const handleFinalize = (e: React.FormEvent) => {
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

  const handleClearAll = () => {
    resetForm();
    if (uid) {
      clearTimetableDraft(uid);
    }
    setClasses([]);
    setIsDirtySinceSubmit(Boolean(studentTimetable));
    setSubmitError(null);
  };

  const handleConfirmSubmit = async (academicMeta: TimetableAcademicMeta) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitFinalTimetableToFirestore({
        classes,
        academicMeta,
        studentFullName: studentData.name,
        existingProfile: studentProfile,
        existingTimetable: studentTimetable,
        existingAvailability: studentAvailability,
      });

      setIsDirtySinceSubmit(false);
      await refreshStudentData();
      navigate('/home', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to save your timetable to Firestore. Please retry.';
      setSubmitError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-[#202124] flex flex-col">
      <TimetableHeader
        isSubmitted={Boolean(studentTimetable?.submissionStatus === 'submitted' && !isDirtySinceSubmit)}
        hasClasses={classes.length > 0}
        onClearAll={handleClearAll}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
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
            onFinalize={handleFinalize}
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

          {/* RIGHT PANEL (26%): My Classes + Timetable Summary + Submit */}
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
              isDirtySinceSubmit={isDirtySinceSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
              onConfirmSubmit={handleConfirmSubmit}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
};
