import React, { useState } from 'react';
import type { MonthlyTrendData, StatusDistribution, CategoryBreakdown } from '../hooks/useReports';

interface TrendChartProps {
  data: MonthlyTrendData[];
  currencySymbol?: string;
}

export const FinancialTrendAreaChart: React.FC<TrendChartProps> = ({
  data,
  currencySymbol = '₹',
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(data && data.length > 0 ? data.length - 1 : 0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-gray-400">
        No trend data available.
      </div>
    );
  }

  const activeIdx = hoveredIdx !== null ? hoveredIdx : selectedIdx;
  const activeItem = data[activeIdx] || data[data.length - 1];

  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.expenses, Math.abs(d.profit))), 1000);
  const height = 220;
  const width = 600;
  const padding = 30;

  const getX = (index: number) => {
    if (data.length <= 1) return width / 2;
    return padding + (index * (width - padding * 2)) / (data.length - 1);
  };

  const getY = (val: number) => {
    return height - padding - (val / maxVal) * (height - padding * 2);
  };

  // Generate SVG Path for Revenue & Expenses
  const revPoints = data.map((d, i) => `${getX(i)},${getY(d.revenue)}`).join(' ');
  const expPoints = data.map((d, i) => `${getX(i)},${getY(d.expenses)}`).join(' ');

  const revAreaPath = `${revPoints} L ${getX(data.length - 1)},${height - padding} L ${getX(0)},${height - padding} Z`;
  const expAreaPath = `${expPoints} L ${getX(data.length - 1)},${height - padding} L ${getX(0)},${height - padding} Z`;

  const colWidth = (width - padding * 2) / (data.length - 1 || 1);

  return (
    <div className="relative w-full space-y-4">
      {/* Header Legend + Clickable Month Selector Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
            <span className="text-gray-700 dark:text-gray-300">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
            <span className="text-gray-700 dark:text-gray-300">Expenses</span>
          </div>
        </div>

        {/* Quick Month Selector Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
          {data.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                activeIdx === i
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {d.month}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => (
            <line
              key={idx}
              x1={padding}
              y1={padding + pct * (height - padding * 2)}
              x2={width - padding}
              y2={padding + pct * (height - padding * 2)}
              stroke="currentColor"
              className="text-gray-200 dark:text-white/5"
              strokeDasharray="4 4"
            />
          ))}

          {/* Filled Areas */}
          <polygon points={revAreaPath} fill="url(#revenueGradient)" />
          <polygon points={expAreaPath} fill="url(#expenseGradient)" />

          {/* Smooth Lines */}
          <polyline points={revPoints} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={expPoints} fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Active Vertical Guide Line */}
          {activeIdx !== null && (
            <line
              x1={getX(activeIdx)}
              y1={padding}
              x2={getX(activeIdx)}
              y2={height - padding}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="3 3"
              className="opacity-60"
            />
          )}

          {/* Data Points */}
          {data.map((d, i) => {
            const isActive = activeIdx === i;
            return (
              <g key={i}>
                <circle
                  cx={getX(i)}
                  cy={getY(d.revenue)}
                  r={isActive ? 7 : 4}
                  className={`transition-all duration-200 stroke-white dark:stroke-[#121118] ${
                    isActive ? 'fill-blue-500 stroke-[3px] shadow-lg' : 'fill-blue-400 stroke-2 opacity-80'
                  }`}
                />
                <circle
                  cx={getX(i)}
                  cy={getY(d.expenses)}
                  r={isActive ? 7 : 4}
                  className={`transition-all duration-200 stroke-white dark:stroke-[#121118] ${
                    isActive ? 'fill-rose-500 stroke-[3px] shadow-lg' : 'fill-rose-400 stroke-2 opacity-80'
                  }`}
                />
                <text
                  x={getX(i)}
                  y={height - 5}
                  textAnchor="middle"
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'fill-blue-500 font-bold text-[11px]' : 'fill-gray-400'
                  }`}
                >
                  {d.month}
                </text>

                {/* Full Height Clickable Hitbox for each Month Column */}
                <rect
                  x={getX(i) - colWidth / 2}
                  y={0}
                  width={colWidth}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => setSelectedIdx(i)}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Selected Month Summary Card */}
        {activeItem && (
          <div className="mt-3 p-4 rounded-2xl border border-gray-200/90 dark:border-white/15 bg-white/90 dark:bg-[#181624]/90 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold font-mono">
                {activeItem.month}
              </span>
              <span className="text-xs text-gray-500 font-medium">Selected Month Summary</span>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono">
              <div>
                <span className="text-gray-400 text-[10px] uppercase tracking-wider block">Revenue</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {currencySymbol}{activeItem.revenue.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] uppercase tracking-wider block">Expenses</span>
                <span className="font-bold text-rose-500 text-sm">
                  {currencySymbol}{activeItem.expenses.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] uppercase tracking-wider block">Net Profit</span>
                <span className={`font-bold text-sm ${activeItem.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {currencySymbol}{activeItem.profit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface CategoryBarChartProps {
  categories: CategoryBreakdown[];
  currencySymbol?: string;
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
  categories,
  currencySymbol = '₹',
}) => {
  if (!categories || categories.length === 0) {
    return <div className="h-48 flex items-center justify-center text-xs text-gray-400">No category breakdown available.</div>;
  }

  const maxVal = Math.max(...categories.map((c) => c.amount), 1);

  return (
    <div className="space-y-3.5">
      {categories.map((cat, idx) => {
        const pct = Math.round((cat.amount / maxVal) * 100);
        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-800 dark:text-gray-200">{cat.category}</span>
              <span className="font-mono text-gray-900 dark:text-white">
                {currencySymbol}{cat.amount.toLocaleString()} ({cat.percentage}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface DistributionDonutProps {
  distributions: StatusDistribution[];
}

export const DistributionDonutChart: React.FC<DistributionDonutProps> = ({ distributions }) => {
  if (!distributions || distributions.length === 0) {
    return <div className="h-48 flex items-center justify-center text-xs text-gray-400">No status distribution.</div>;
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
      <div className="relative flex justify-center">
        <svg viewBox="0 0 100 100" className="w-36 h-36 -rotate-90">
          {distributions.map((item, idx) => {
            const strokeDashoffset = -distributions
              .slice(0, idx)
              .reduce((acc, curr) => acc + (curr.percentage / 100) * 251.2, 0);
            const strokeDasharray = `${(item.percentage / 100) * 251.2} 251.2`;

            return (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={colors[idx % colors.length]}
                strokeWidth="12"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:opacity-80"
              />
            );
          })}
        </svg>
      </div>

      <div className="space-y-2">
        {distributions.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
              <span className="font-medium text-gray-700 dark:text-gray-300">{item.status}</span>
            </div>
            <span className="font-mono font-bold text-gray-900 dark:text-white">
              {item.count} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
