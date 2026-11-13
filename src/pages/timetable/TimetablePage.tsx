import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { cloneDemoTimetableClasses } from '../../data/mockTimetable';
import {
  clearTimetableSubmissionForStudent,
  loadLastTimetableSubmission,
  loadTimetableForStudent,
  saveTimetableForStudent,
  submitTimetableForTesting,
} from '../../services/timetableService';
import {
  ClassFormValues,
  TimeSlotId,
  TimetableClassEntry,
  TimetableSubmissionRecord,
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
  const { user, studentProfile, studentData } = useAuth();
  const uid = user?.uid || 'anonymous';

  const [classes, setClasses] = useState<TimetableClassEntry[]>([]);
  const [isDemoData, setIsDemoData] = useState<boolean>(true);
  const [formValues, setFormValues] = useState<ClassFormValues>(EMPTY_FORM);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<WeekdayId[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    TimetableValidationResult['errors'] | null
  >(null);

  const [lastSubmission, setLastSubmission] = useState<TimetableSubmissionRecord | null>(null);
  const [isDirtySinceSubmit, setIsDirtySinceSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hydrate initial timetable & last submission per authenticated UID
  useEffect(() => {
    const stored = loadTimetableForStudent(uid);
    setClasses(stored.classes);
    setIsDemoData(stored.isDemoData);
    setLastSubmission(loadLastTimetableSubmission(uid));
    setIsDirtySinceSubmit(false);
  }, [uid]);

  const persistClasses = (nextClasses: TimetableClassEntry[], nextIsDemo: boolean) => {
    setClasses(nextClasses);
    setIsDemoData(nextIsDemo);
    setIsDirtySinceSubmit(true);
    saveTimetableForStudent(uid, {
      classes: nextClasses,
      isDemoData: nextIsDemo,
      updatedAt: new Date().toISOString(),
    });
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
      setValidationErrors((prev) => (prev ? { ...prev, [field]: undefined, duplicate: undefined } : null));
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
    persistClasses(nextClasses, nextClasses.some((c) => Boolean(c.isDemo)));
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
              isDemo: false,
              updatedAt: timestamp,
            }
          : cls
      );
      persistClasses(nextClasses, nextClasses.some((c) => Boolean(c.isDemo)));
    } else {
      const newEntry: TimetableClassEntry = {
        id: `cls-${cleanCode}-${Date.now().toString(36)}`,
        subjectCode: cleanCode,
        subjectName: cleanName,
        subjectAbbreviation: abbr,
        facultyName: cleanFaculty,
        days,
        scheduleByDay,
        isDemo: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      // Keep demo subjects cleanly separated if student hasn't cleared demo yet;
      // student can remove demo subjects anytime with 1 click without losing their added classes.
      const nextClasses = [...classes, newEntry];
      persistClasses(nextClasses, isDemoData);
    }

    resetForm();
  };

  const handleClearDemoOnly = () => {
    const studentOnlyClasses = classes.filter((cls) => !cls.isDemo);
    resetForm();
    persistClasses(studentOnlyClasses, false);
  };

  const handleClearAll = () => {
    resetForm();
    clearTimetableSubmissionForStudent(uid);
    setLastSubmission(null);
    persistClasses([], false);
  };

  const handleRestoreDemo = () => {
    resetForm();
    clearTimetableSubmissionForStudent(uid);
    setLastSubmission(null);
    persistClasses(cloneDemoTimetableClasses(), true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const studentName = studentProfile?.fullName || user?.displayName || studentData.name;
      const studentEmail = studentProfile?.email || user?.email || studentData.email;
      const record = await submitTimetableForTesting({
        studentUid: uid,
        studentName,
        studentEmail,
        classes,
        summary,
      });
      setLastSubmission(record);
      setIsDirtySinceSubmit(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-[#202124] flex flex-col">
      <TimetableHeader
        isDemoData={isDemoData}
        isSubmitted={Boolean(lastSubmission && !isDirtySinceSubmit)}
        onClearAll={handleClearAll}
        onRestoreDemo={handleRestoreDemo}
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
            isDemoData={isDemoData}
            onSelectEmptyCell={handleSelectEmptyCell}
            onSelectOccupiedCell={handleEditClass}
            onResetView={resetForm}
            onClearDemoData={handleClearDemoOnly}
          />

          {/* RIGHT PANEL (26%): My Classes + Timetable Summary + Submit */}
          <div className="space-y-5">
            <MyClassesPanel
              classes={classes}
              editingClassId={editingClassId}
              onEditClass={handleEditClass}
              onDeleteClass={handleDeleteClass}
              onRestoreDemo={handleRestoreDemo}
            />

            <TimetableSummary summary={summary} />

            <SubmitTimetableCard
              classes={classes}
              summary={summary}
              hasConflicts={internalConflicts.length > 0}
              lastSubmission={lastSubmission}
              isDirtySinceSubmit={isDirtySinceSubmit}
              isSubmitting={isSubmitting}
              onConfirmSubmit={handleConfirmSubmit}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
};
