import React from 'react';
import { Card } from '../common/Card';
import { TeamBudgetItem } from '../../types/dashboard';
import { Shield, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TeamBudgetTableProps {
  teams: TeamBudgetItem[];
}

export const TeamBudgetTable: React.FC<TeamBudgetTableProps> = ({ teams }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Card glow className="overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            Franchise Purse & Budget Utilization
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active club purse limits, auction expenditure, and squad fill rate
          </p>
        </div>

        <Link
          to="/teams"
          className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors"
        >
          <span>View All 8 Teams</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-pitch-border text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-3">Team</th>
              <th className="py-3 px-3">Squad Slots</th>
              <th className="py-3 px-3 text-right">Total Purse</th>
              <th className="py-3 px-3 text-right">Spent</th>
              <th className="py-3 px-3 text-right">Remaining Purse</th>
              <th className="py-3 px-3 text-right">Purse Utilization</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pitch-border/50 text-xs">
            {teams.map((team, idx) => {
              const spentPct = Math.round((team.spentBudget / team.totalBudget) * 100);
              const maxSlots = 15;
              const slotsPct = Math.round((team.playersCount / maxSlots) * 100);

              return (
                <tr
                  key={team.teamName}
                  className="hover:bg-pitch-cardHover/70 transition-colors group"
                >
                  {/* Team Name */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-pitch-border flex items-center justify-center font-bold text-xs text-orange-400 group-hover:border-orange-500/40 group-hover:shadow-pitch-glow transition-all">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-orange-400 transition-colors">
                          {team.teamName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Rank #{idx + 1} By Spending
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Squad Slots */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">
                        {team.playersCount} / {maxSlots}
                      </span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${slotsPct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Total Purse */}
                  <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-300">
                    {formatCurrency(team.totalBudget)}
                  </td>

                  {/* Spent */}
                  <td className="py-3.5 px-3 text-right font-mono font-semibold text-amber-400">
                    {formatCurrency(team.spentBudget)}
                  </td>

                  {/* Remaining */}
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-orange-400">
                    {formatCurrency(team.remainingBudget)}
                  </td>

                  {/* Progress Bar */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <span className="text-[11px] font-mono font-semibold text-slate-300">
                        {spentPct}%
                      </span>
                      <div className="w-20 sm:w-24 h-2 rounded-full bg-slate-800/80 border border-pitch-border overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            spentPct > 70
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : 'bg-gradient-to-r from-orange-500 to-amber-400'
                          }`}
                          style={{ width: `${spentPct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
