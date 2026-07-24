import React, { useState } from 'react';

export interface MonthlyDataPoint {
  month: string;
  year?: number;
  total: number;
}

interface AnimatedDashboardChartProps {
  data: MonthlyDataPoint[];
  currencySymbol?: string;
}

export const AnimatedDashboardChart: React.FC<AnimatedDashboardChartProps> = ({
  data,
  currencySymbol = '₹',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-xs text-gray-400">
        No revenue trend data available.
      </div>
    );
  }

  const activeIdx = hoveredIdx !== null ? hoveredIdx : data.length - 1;
  const activePoint = data[activeIdx];

  const maxTotal = Math.max(...data.map((d) => d.total), 1000);

  // Y-axis 5 step values
  const ySteps = [
    maxTotal,
    maxTotal * 0.75,
    maxTotal * 0.5,
    maxTotal * 0.25,
    0,
  ];

  // Smart currency formatter matching screenshot (Cr, L, K, 0)
  const formatYVal = (val: number) => {
    if (val === 0) return `${currencySymbol}0`;
    if (val >= 10000000) {
      const cr = val / 10000000;
      return `${currencySymbol}${cr % 1 === 0 ? cr : cr.toFixed(1)}Cr`;
    }
    if (val >= 100000) {
      const l = val / 100000;
      return `${currencySymbol}${l % 1 === 0 ? l : l.toFixed(1)}L`;
    }
    if (val >= 1000) {
      const k = val / 1000;
      return `${currencySymbol}${k % 1 === 0 ? k : k.toFixed(1)}K`;
    }
    return `${currencySymbol}${Math.round(val)}`;
  };

  const height = 200;
  const width = 600;
  const paddingLeft = 65;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index * chartWidth) / (data.length - 1);
  };

  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / maxTotal) * chartHeight;
  };

  const points = data.map((d, i) => ({
    x: getX(i),
    y: getY(d.total),
    data: d,
  }));

  // Generate Smooth Bézier Curve Path
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      const cp2y = next.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  const colWidth = chartWidth / (data.length - 1 || 1);

  return (
    <div className="relative w-full select-none">
      {/* SVG Canvas */}
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            {/* Glowing Orange/Blue Gradient Area Fill */}
            <linearGradient id="chartGradientOrange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#f97316" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="chartLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>

            {/* Pulsing Drop Shadow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Y-Axis Scale Labels & Horizontal Grid Lines */}
          {ySteps.map((val, idx) => {
            const yPos = paddingTop + (idx * chartHeight) / (ySteps.length - 1);
            return (
              <g key={idx}>
                {/* Horizontal Dashed Grid Line */}
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={width - paddingRight}
                  y2={yPos}
                  stroke="currentColor"
                  className="text-gray-200/50 dark:text-white/5"
                  strokeDasharray="3 3"
                />

                {/* Y-Axis Currency Label */}
                <text
                  x={paddingLeft - 10}
                  y={yPos + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono font-semibold fill-gray-400 dark:fill-gray-500"
                >
                  {formatYVal(val)}
                </text>
              </g>
            );
          })}

          {/* Area Gradient Fill with Smooth Fade */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#chartGradientOrange)"
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* Animated Smooth Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#chartLineGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* Active Hover Guide Line */}
          {activeIdx !== null && points[activeIdx] && (
            <line
              x1={points[activeIdx].x}
              y1={paddingTop}
              x2={points[activeIdx].x}
              y2={paddingTop + chartHeight}
              stroke="#f97316"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-75 transition-all duration-200"
            />
          )}

          {/* Data Points & X-Axis Labels */}
          {points.map((pt, i) => {
            const isActive = activeIdx === i;
            return (
              <g key={i}>
                {/* Outer Pulsing Aura Ring on Active Point */}
                {isActive && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="12"
                    fill="#f97316"
                    fillOpacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Point Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 6 : 4}
                  className={`transition-all duration-300 stroke-white dark:stroke-[#121118] ${
                    isActive
                      ? 'fill-orange-500 stroke-[3px] scale-125'
                      : 'fill-orange-400 stroke-2 opacity-80 hover:opacity-100'
                  }`}
                />

                {/* X-Axis Month Label */}
                <text
                  x={pt.x}
                  y={height - 8}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'fill-orange-500 font-bold text-[12px]'
                      : 'fill-gray-400 dark:fill-gray-400'
                  }`}
                >
                  {pt.data.month}
                </text>

                {/* Invisible Hover Rect */}
                <rect
                  x={pt.x - colWidth / 2}
                  y={0}
                  width={colWidth}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Active Glassmorphic Tooltip */}
        {activePoint && (
          <div
            style={{
              left: `${((points[activeIdx]?.x || paddingLeft) / width) * 100}%`,
              top: `${((points[activeIdx]?.y || paddingTop) / height) * 100}%`,
            }}
            className="absolute z-30 p-2.5 rounded-xl border border-orange-500/30 bg-[#121118]/95 text-white shadow-2xl space-y-0.5 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-3 backdrop-blur-xl transition-all duration-200"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
              {activePoint.month} {activePoint.year || ''}
            </div>
            <div className="text-xs font-mono font-bold text-white">
              Revenue: {currencySymbol}
              {activePoint.total.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
