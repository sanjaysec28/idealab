import React from 'react';
import { BarChart3 } from 'lucide-react';
import { TimetableSummaryMetrics } from '../../types/timetable';

interface TimetableSummaryProps {
  summary: TimetableSummaryMetrics;
}

export const TimetableSummary: React.FC<TimetableSummaryProps> = ({ summary }) => {
  return (
    <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-xs p-5 space-y-3.5">
      <div className="flex items-center justify-between pb-3 border-b border-[#EAE6E1]">
        <h2 className="text-sm font-bold text-[#202124]">Timetable Summary</h2>
        <BarChart3 className="w-4 h-4 text-[#E63946]" />
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#777777]">Total Subjects</span>
          <span className="font-bold text-[#202124]">{summary.totalSubjects}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#777777]">Scheduled Periods</span>
          <span className="font-bold text-[#202124]">
            {summary.totalClasses} / {summary.totalPossiblePeriods}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#777777]">Free Periods</span>
          <span className="font-bold text-[#202124]">{summary.freePeriods}</span>
        </div>
      </div>

      {/* Highlighted Utilization Box */}
      <div className="rounded-2xl bg-[#FFF0F1] border border-[#E63946]/15 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#202124]">Utilization</span>
          <span className="text-sm font-extrabold text-[#E63946]">
            {summary.utilizationPercent}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white overflow-hidden">
          <div
            className="h-full rounded-full bg-[#E63946] transition-all duration-300"
            style={{ width: `${Math.min(100, summary.utilizationPercent)}%` }}
          />
        </div>
      </div>
    </section>
  );
};
