import React, { useState } from 'react';
import { Card } from '../common/Card';
import { ChartDataPoint } from '../../types/dashboard';
import { TrendingUp, Calendar } from 'lucide-react';

interface RegistrationTrendsChartProps {
  data: ChartDataPoint[];
}

export const RegistrationTrendsChart: React.FC<RegistrationTrendsChartProps> = ({ data }) => {
  const [activePoint, setActivePoint] = useState<ChartDataPoint | null>(null);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 10);
  const chartHeight = 160;
  const chartWidth = 500;
  const paddingX = 30;
  const paddingY = 20;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (d.value / maxValue) * (chartHeight - paddingY * 2);
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, point, index) => {
    return index === 0
      ? `M ${point.x} ${point.y}`
      : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <Card className="h-full flex flex-col justify-between" glow>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Registration Velocity & Growth
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative player applications leading up to auction cutoff
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+148 Total</span>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="relative w-full pt-2">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-44 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pitchGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const yVal = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
              return (
                <line
                  key={ratio}
                  x1={paddingX}
                  y1={yVal}
                  x2={chartWidth - paddingX}
                  y2={yVal}
                  stroke="#24344d"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled Area */}
            <path d={areaD} fill="url(#pitchGradient)" />

            {/* Primary Curve */}
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Points */}
            {points.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={activePoint?.label === pt.data.label ? '6' : '4'}
                  className="fill-pitch-darkest stroke-emerald-400 stroke-[2.5px] cursor-pointer hover:r-6 transition-all"
                  onMouseEnter={() => setActivePoint(pt.data)}
                  onMouseLeave={() => setActivePoint(null)}
                />
              </g>
            ))}
          </svg>

          {/* Active tooltip popover */}
          {activePoint && (
            <div className="absolute top-2 right-4 bg-pitch-darkest border border-emerald-500/50 rounded-xl px-3 py-1.5 shadow-pitch-glow text-xs pointer-events-none">
              <span className="font-bold text-white">{activePoint.value} players</span>
              <span className="text-slate-400 ml-1.5">({activePoint.label})</span>
            </div>
          )}
        </div>

        {/* Timeline Axis Labels */}
        <div className="flex justify-between px-2 pt-2 border-t border-pitch-border/50 text-[11px] text-slate-400">
          {data.map((d) => (
            <span key={d.label}>{d.label}</span>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-pitch-border/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-400" />
          Auction Window: 30-Day Registration Cycle
        </span>
        <span className="text-slate-300 font-mono">Cutoff: 100% Complete</span>
      </div>
    </Card>
  );
};
