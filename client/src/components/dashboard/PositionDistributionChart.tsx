import React from 'react';
import { Card } from '../common/Card';
import { ChartDataPoint } from '../../types/dashboard';
import { ShieldAlert, Crosshair, Compass, Shield } from 'lucide-react';

interface PositionDistributionChartProps {
  data: ChartDataPoint[];
}

const positionIcons: Record<string, React.ReactNode> = {
  FWD: <Crosshair className="w-4 h-4 text-rose-400" />,
  MID: <Compass className="w-4 h-4 text-emerald-400" />,
  DEF: <Shield className="w-4 h-4 text-blue-400" />,
  GK: <ShieldAlert className="w-4 h-4 text-amber-400" />,
};

export const PositionDistributionChart: React.FC<PositionDistributionChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;

  return (
    <Card className="h-full flex flex-col justify-between" glow>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Player Position Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Approved pool breakdown across squad roles
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-pitch-darker px-2.5 py-1 rounded-lg border border-pitch-border">
            {total} Players
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800/80 overflow-hidden flex gap-0.5 p-0.5 border border-pitch-border mb-6">
          {data.map((item) => {
            const pct = (item.value / total) * 100;
            return (
              <div
                key={item.label}
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.color || '#10b981',
                }}
                className="h-full rounded-sm transition-all duration-500 hover:brightness-125"
                title={`${item.label}: ${item.value} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Position Rows */}
        <div className="space-y-3">
          {data.map((item) => {
            const pct = Math.round((item.value / total) * 100);
            const code = item.label.includes('(')
              ? item.label.split('(')[1].replace(')', '')
              : 'POS';

            return (
              <div
                key={item.label}
                className="group p-2.5 rounded-xl bg-pitch-darker/60 hover:bg-pitch-card transition-colors border border-pitch-border/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: `${item.color || '#10b981'}15`,
                      color: item.color || '#10b981',
                      border: `1px solid ${item.color || '#10b981'}40`,
                    }}
                  >
                    {positionIcons[code] || code}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Tactical target ratio: {pct}%
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-extrabold text-white">
                    {item.value}
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400">
                    {pct}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-pitch-border/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>Formation target: 4-3-3 balanced</span>
        <span className="text-emerald-400 font-semibold">Ready for Draft</span>
      </div>
    </Card>
  );
};
