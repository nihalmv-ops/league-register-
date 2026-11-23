import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ActivityItem } from '../../types/dashboard';
import {
  UserPlus,
  CheckCircle2,
  Gavel,
  Shield,
  Calendar,
  Filter,
} from 'lucide-react';

interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

const typeIcons: Record<string, React.ReactNode> = {
  registration: <UserPlus className="w-4 h-4 text-blue-400" />,
  approval: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  auction: <Gavel className="w-4 h-4 text-amber-400" />,
  team: <Shield className="w-4 h-4 text-purple-400" />,
  fixture: <Calendar className="w-4 h-4 text-rose-400" />,
};

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredActivities = activities.filter((act) => {
    if (filter === 'all') return true;
    return act.type === filter;
  });

  return (
    <Card glow className="h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              Recent League Activity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time audit log of player submissions, approvals & league events
            </p>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1 bg-pitch-darker p-1 rounded-xl border border-pitch-border text-[11px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-orange-500/20 text-orange-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('registration')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'registration'
                  ? 'bg-blue-500/20 text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Registrations
            </button>
            <button
              onClick={() => setFilter('approval')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'approval'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Approvals
            </button>
            <button
              onClick={() => setFilter('auction')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                filter === 'auction'
                  ? 'bg-amber-500/20 text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auction
            </button>
          </div>
        </div>

        {/* Activity Timeline List */}
        <div className="space-y-3 mt-3">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No activity logs found for this filter.
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-pitch-darker/60 hover:bg-pitch-card transition-colors border border-pitch-border/50 flex items-start gap-3.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-pitch-dark border border-pitch-border flex items-center justify-center shrink-0 mt-0.5 group-hover:border-orange-500/30 transition-colors">
                  {typeIcons[act.type] || <Filter className="w-4 h-4 text-slate-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-100 group-hover:text-orange-400 transition-colors truncate">
                      {act.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {act.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                    {act.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-pitch-border/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>Logged automatically by System Auditor</span>
        <Badge variant="green" size="sm">
          Live Streamed
        </Badge>
      </div>
    </Card>
  );
};
