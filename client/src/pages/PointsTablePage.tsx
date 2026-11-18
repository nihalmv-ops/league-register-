import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { LeagueStanding } from '../types/football';

const mockStandings: LeagueStanding[] = [
  { rank: 1, team: 'Thunder Strikers FC', shortCode: 'TSFC', played: 5, won: 4, drawn: 1, lost: 0, goalsFor: 12, goalsAgainst: 4, goalDifference: 8, points: 13, form: ['W', 'W', 'D', 'W', 'W'] },
  { rank: 2, team: 'Metro City United', shortCode: 'MCU', played: 5, won: 3, drawn: 2, lost: 0, goalsFor: 10, goalsAgainst: 5, goalDifference: 5, points: 11, form: ['W', 'D', 'W', 'W', 'D'] },
  { rank: 3, team: 'Apex Predators', shortCode: 'APEX', played: 5, won: 3, drawn: 1, lost: 1, goalsFor: 11, goalsAgainst: 7, goalDifference: 4, points: 10, form: ['W', 'L', 'W', 'W', 'D'] },
  { rank: 4, team: 'Emerald Warriors', shortCode: 'EWAR', played: 5, won: 2, drawn: 2, lost: 1, goalsFor: 7, goalsAgainst: 5, goalDifference: 2, points: 8, form: ['D', 'W', 'L', 'D', 'W'] },
  { rank: 5, team: 'Red Dragons SC', shortCode: 'RDSC', played: 5, won: 2, drawn: 1, lost: 2, goalsFor: 8, goalsAgainst: 9, goalDifference: -1, points: 7, form: ['L', 'W', 'D', 'W', 'L'] },
  { rank: 6, team: 'Northern Wolves', shortCode: 'NWFC', played: 5, won: 1, drawn: 2, lost: 2, goalsFor: 6, goalsAgainst: 8, goalDifference: -2, points: 5, form: ['D', 'L', 'W', 'L', 'D'] },
  { rank: 7, team: 'Golden Eagles SC', shortCode: 'GESC', played: 5, won: 1, drawn: 0, lost: 4, goalsFor: 5, goalsAgainst: 11, goalDifference: -6, points: 3, form: ['L', 'W', 'L', 'L', 'L'] },
  { rank: 8, team: 'Coastal Vipers FC', shortCode: 'CVFC', played: 5, won: 0, drawn: 1, lost: 4, goalsFor: 3, goalsAgainst: 13, goalDifference: -10, points: 1, form: ['L', 'L', 'D', 'L', 'L'] },
];

export const PointsTablePage: React.FC = () => {
  const [standings] = useState<LeagueStanding[]>(mockStandings);

  const getFormPill = (form: 'W' | 'D' | 'L', idx: number) => {
    switch (form) {
      case 'W':
        return (
          <span
            key={idx}
            className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-[10px]"
            title="Win"
          >
            W
          </span>
        );
      case 'D':
        return (
          <span
            key={idx}
            className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[10px]"
            title="Draw"
          >
            D
          </span>
        );
      case 'L':
        return (
          <span
            key={idx}
            className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-[10px]"
            title="Loss"
          >
            L
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Championship Points Table</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Season 2026/27 Live Standings
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time league rankings, goals, form streaks, and playoff qualification spots.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            Playoffs Zone (Top 4)
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            Mid-Table
          </span>
        </div>
      </div>

      {/* Standings Table Card */}
      <Card padding="none" className="overflow-hidden" glow>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-pitch-border bg-pitch-darker text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 text-center w-12">Pos</th>
                <th className="py-3.5 px-4">Club</th>
                <th className="py-3.5 px-3 text-center">P</th>
                <th className="py-3.5 px-3 text-center">W</th>
                <th className="py-3.5 px-3 text-center">D</th>
                <th className="py-3.5 px-3 text-center">L</th>
                <th className="py-3.5 px-3 text-center">GF</th>
                <th className="py-3.5 px-3 text-center">GA</th>
                <th className="py-3.5 px-3 text-center">GD</th>
                <th className="py-3.5 px-4 text-center">PTS</th>
                <th className="py-3.5 px-4 text-center">Last 5 Matches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-border/50">
              {standings.map((team) => {
                const isTop4 = team.rank <= 4;

                return (
                  <tr
                    key={team.rank}
                    className={`hover:bg-pitch-cardHover transition-colors ${
                      isTop4 ? 'bg-emerald-950/10' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <span
                          className={`w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center ${
                            team.rank === 1
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm'
                              : isTop4
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'text-slate-400 bg-pitch-darker border border-pitch-border'
                          }`}
                        >
                          {team.rank}
                        </span>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-slate-400 bg-pitch-darker px-1.5 py-0.5 rounded border border-pitch-border">
                          {team.shortCode}
                        </span>
                        <span className="font-bold text-white text-sm">{team.team}</span>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-300">
                      {team.played}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-emerald-400">
                      {team.won}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-400">
                      {team.drawn}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-rose-400">
                      {team.lost}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                      {team.goalsFor}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-400">
                      {team.goalsAgainst}
                    </td>
                    <td
                      className={`py-3.5 px-3 text-center font-mono font-bold ${
                        team.goalDifference > 0
                          ? 'text-emerald-400'
                          : team.goalDifference < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </td>

                    {/* Points */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-sm font-black font-mono text-white bg-pitch-darker px-2.5 py-1 rounded-lg border border-pitch-border">
                        {team.points}
                      </span>
                    </td>

                    {/* Form pills */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {team.form.map((f, i) => getFormPill(f, i))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
