import React from 'react';
import { Download, FileText } from 'lucide-react';
import type { ReportFilterParams } from '../hooks/useReports';

interface ReportFiltersProps {
  filters: ReportFilterParams;
  onFilterChange: (newFilters: ReportFilterParams) => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  title?: string;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFilterChange,
  onExportCSV,
  onExportPDF,
  title = 'Financial Intelligence & Reports',
}) => {
  const handlePeriodChange = (period: ReportFilterParams['period']) => {
    onFilterChange({ ...filters, period });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-white/10 mb-6 print:hidden">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-heading">
          {title}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Real-time aggregation, P&L statements, trends, and business analytics.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Preset Period Pills */}
        <div className="flex items-center gap-1 p-1 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-md shadow-sm">
          <button
            onClick={() => handlePeriodChange('this_month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filters.period === 'this_month' || !filters.period
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => handlePeriodChange('this_quarter')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filters.period === 'this_quarter'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            This Quarter
          </button>
          <button
            onClick={() => handlePeriodChange('this_year')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filters.period === 'this_year'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            This Year
          </button>
          <button
            onClick={() => handlePeriodChange('all_time')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filters.period === 'all_time'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All Time
          </button>
        </div>

        {/* CSV & PDF Export Buttons */}
        <div className="flex items-center gap-2">
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#181624] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
              title="Export Report to CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>Export CSV</span>
            </button>
          )}

          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer active:scale-95"
              title="Export or Print Report as high-resolution PDF document"
            >
              <FileText className="w-3.5 h-3.5 text-white" />
              <span>Export PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
