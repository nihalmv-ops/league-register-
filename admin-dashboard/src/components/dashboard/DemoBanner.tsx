import React from 'react';
import { Sparkles, Database } from 'lucide-react';
import { Badge } from '../common/Badge';

interface DemoBannerProps {
  isDemoData: boolean;
  dbStatus: string;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ isDemoData, dbStatus }) => {
  if (!isDemoData && dbStatus === 'connected') return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/40 via-pitch-card to-slate-900 border border-emerald-500/30 p-4 mb-6 shadow-pitch-glow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white">
                Phase 1 Showcase Mode: Demo Data Active
              </h4>
              <Badge variant="yellow" size="sm" dot>
                Sample Data
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Metrics, charts, and activity feeds are populated with simulated league data.
              {dbStatus === 'connected'
                ? ' MongoDB is connected and ready to persist production records.'
                : ' Connect MongoDB locally (or via MONGODB_URI) to activate persistent database storage.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-[11px] font-mono text-emerald-400 bg-pitch-darkest/90 px-3 py-1 rounded-lg border border-pitch-border flex items-center gap-1.5">
            <Database className="w-3 h-3 text-emerald-400" />
            DB: {dbStatus.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
