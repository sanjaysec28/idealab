import React, { useState } from 'react';
import { Pencil, Trash2, BookOpen, RotateCcw } from 'lucide-react';
import { TimetableClassEntry } from '../../types/timetable';
import { formatClassScheduleSummary } from '../../utils/timetableCalculations';

interface MyClassesPanelProps {
  classes: TimetableClassEntry[];
  editingClassId: string | null;
  onEditClass: (entry: TimetableClassEntry) => void;
  onDeleteClass: (classId: string) => void;
  onRestoreDemo: () => void;
}

export const MyClassesPanel: React.FC<MyClassesPanelProps> = ({
  classes,
  editingClassId,
  onEditClass,
  onDeleteClass,
  onRestoreDemo,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-xs p-5">
      <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#EAE6E1]">
        <h2 className="text-sm font-bold text-[#202124]">
          My Classes ({classes.length})
        </h2>
        <span className="text-[11px] font-medium text-[#777777]">
          Unique Subjects
        </span>
      </div>

      {classes.length === 0 ? (
        <div className="py-7 text-center space-y-2.5">
          <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#EAE6E1] text-[#777777] flex items-center justify-center mx-auto">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#202124]">No classes added yet</p>
            <p className="text-[11px] text-[#777777]">
              Add a subject on the left panel to build your schedule.
            </p>
          </div>
          <button
            type="button"
            onClick={onRestoreDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F1EC] border border-[#EAE6E1] text-[11px] font-semibold text-[#202124] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-[#E63946]" />
            <span>Load Sample Timetable</span>
          </button>
        </div>
      ) : (
        <div className="mt-3.5 space-y-2.5 max-h-[300px] overflow-y-auto pr-0.5">
          {classes.map((cls) => {
            const isEditing = editingClassId === cls.id;
            const isConfirmingDelete = confirmDeleteId === cls.id;

            return (
              <div
                key={cls.id}
                className={`rounded-2xl border p-3.5 transition-all ${
                  isEditing
                    ? 'bg-[#FFF0F1]/60 border-[#E63946]'
                    : 'bg-white border-[#EAE6E1] hover:border-[#D8D2CB]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0F1] text-[#E63946] font-extrabold text-xs flex items-center justify-center shrink-0">
                    {cls.subjectAbbreviation}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#202124] truncate">
                          {cls.subjectName}
                        </p>
                        <p className="text-[11px] text-[#777777] truncate mt-0.5">
                          <span className="font-semibold text-[#202124]/80">
                            {cls.subjectCode}
                          </span>{' '}
                          • {cls.facultyName}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDeleteId(null);
                            onEditClass(cls);
                          }}
                          aria-label={`Edit ${cls.subjectName}`}
                          className="w-7 h-7 rounded-lg hover:bg-[#FAF8F5] text-[#777777] hover:text-[#202124] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDeleteId((prev) =>
                              prev === cls.id ? null : cls.id
                            )
                          }
                          aria-label={`Delete ${cls.subjectName}`}
                          className="w-7 h-7 rounded-lg hover:bg-[#FFF0F1] text-[#777777] hover:text-[#E63946] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-1.5 text-[10px] font-medium text-[#777777]">
                      {formatClassScheduleSummary(cls)}
                    </p>
                  </div>
                </div>

                {isConfirmingDelete && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#EAE6E1] flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-[#202124]">
                      Remove {cls.subjectCode} from timetable?
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F1EC] text-[11px] font-semibold text-[#777777] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeleteId(null);
                          onDeleteClass(cls.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#E63946] hover:bg-[#D92F3C] text-[11px] font-semibold text-white cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
