import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

interface SquadMember {
  id: string;
  name: string;
  jersey: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  rating: number;
  acquiredPrice: number;
  role: 'Captain' | 'Vice-Captain' | 'Starter' | 'Squad';
  nationality: string;
}

const mockSquads: Record<string, { teamName: string; code: string; logo: string; purseSpent: number; formation: string; players: SquadMember[] }> = {
  't-1': {
    teamName: 'Thunder Strikers FC',
    code: 'TSFC',
    logo: '⚡',
    purseSpent: 940000,
    formation: '4-3-3 Attacking',
    players: [
      { id: 'sq-1', name: 'Alexander Lindqvist', jersey: 1, position: 'GK', rating: 83, acquiredPrice: 190000, role: 'Starter', nationality: 'Sweden' },
      { id: 'sq-2', name: 'Tariq Al-Mansoor', jersey: 4, position: 'DEF', rating: 84, acquiredPrice: 220000, role: 'Captain', nationality: 'Morocco' },
      { id: 'sq-3', name: 'Liam Gallagher', jersey: 5, position: 'DEF', rating: 78, acquiredPrice: 80000, role: 'Starter', nationality: 'Ireland' },
      { id: 'sq-4', name: 'Julian Draxler', jersey: 8, position: 'MID', rating: 86, acquiredPrice: 310000, role: 'Vice-Captain', nationality: 'Germany' },
      { id: 'sq-5', name: 'Lucas Ferreira', jersey: 6, position: 'MID', rating: 82, acquiredPrice: 130000, role: 'Starter', nationality: 'Brazil' },
      { id: 'sq-6', name: 'Mateo Rossi', jersey: 10, position: 'FWD', rating: 88, acquiredPrice: 380000, role: 'Starter', nationality: 'Argentina' },
      { id: 'sq-7', name: 'Kenji Takahashi', jersey: 11, position: 'FWD', rating: 77, acquiredPrice: 85000, role: 'Squad', nationality: 'Japan' },
    ],
  },
  't-2': {
    teamName: 'Apex Predators',
    code: 'APEX',
    logo: '🦅',
    purseSpent: 810000,
    formation: '4-2-3-1 Modern',
    players: [
      { id: 'sq-201', name: 'Hugo Bernard', jersey: 1, position: 'GK', rating: 82, acquiredPrice: 160000, role: 'Starter', nationality: 'France' },
      { id: 'sq-202', name: 'Dmitri Volkov', jersey: 3, position: 'DEF', rating: 81, acquiredPrice: 150000, role: 'Starter', nationality: 'Serbia' },
      { id: 'sq-203', name: 'Kofi Mensah', jersey: 7, position: 'FWD', rating: 81, acquiredPrice: 190000, role: 'Starter', nationality: 'Ghana' },
      { id: 'sq-204', name: 'Arthur Pendelton', jersey: 10, position: 'MID', rating: 85, acquiredPrice: 280000, role: 'Captain', nationality: 'England' },
      { id: 'sq-205', name: 'Samuel Etoile', jersey: 9, position: 'FWD', rating: 79, acquiredPrice: 120000, role: 'Squad', nationality: 'Cameroon' },
      { id: 'sq-206', name: 'Leon Goretz', jersey: 4, position: 'DEF', rating: 80, acquiredPrice: 140000, role: 'Starter', nationality: 'Austria' },
    ],
  },
};

export const TeamSquadsPage: React.FC = () => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('t-1');
  const activeSquad = mockSquads[selectedTeamId] || mockSquads['t-1'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Team Squads & Tactical Formations</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
              {activeSquad.players.length} Players Drafted
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage franchise rosters, squad depth, captaincy hierarchy, and starting XI configurations.
          </p>
        </div>

        {/* Team Selector Pills */}
        <div className="flex items-center gap-2">
          {Object.entries(mockSquads).map(([id, t]) => (
            <button
              key={id}
              onClick={() => setSelectedTeamId(id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedTeamId === id
                  ? 'bg-football-accent text-slate-950 shadow-pitch-glow'
                  : 'bg-pitch-darker text-slate-300 hover:text-white border border-pitch-border'
              }`}
            >
              <span>{t.logo}</span>
              <span>{t.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Team Profile Banner */}
      <Card glow className="bg-gradient-to-r from-pitch-card via-pitch-darker to-slate-900">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-pitch-darkest border border-pitch-border flex items-center justify-center text-3xl shadow-pitch-glow">
              {activeSquad.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{activeSquad.teamName}</h3>
                <Badge variant="green" size="sm">
                  {activeSquad.formation}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Roster Allocation: {activeSquad.players.length} / 15 Players • Total Spend: ${activeSquad.purseSpent.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Avg Squad Rating</span>
              <span className="text-xl font-extrabold text-emerald-400 font-mono">
                {Math.round(
                  activeSquad.players.reduce((sum, p) => sum + p.rating, 0) /
                    (activeSquad.players.length || 1)
                )}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Virtual Football Pitch Diagram Preview */}
      <Card glow className="relative overflow-hidden p-6 bg-emerald-950/20 border-emerald-500/30">
        <div className="absolute inset-0 pitch-pattern opacity-40 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center py-6">
          <div className="w-full max-w-2xl border-2 border-emerald-500/40 rounded-2xl p-6 bg-slate-950/60 backdrop-blur-sm relative">
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-emerald-500/30 pointer-events-none" />
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-emerald-500/30 pointer-events-none" />

            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-pitch-darkest/90 px-3 py-1 rounded-full border border-emerald-500/30">
                Starting XI Tactical Formation Preview
              </span>
            </div>

            {/* Attackers row */}
            <div className="flex justify-around items-center mb-10">
              {activeSquad.players
                .filter((p) => p.position === 'FWD')
                .map((p) => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center font-bold text-xs shadow-pitch-glow">
                      {p.jersey}
                    </div>
                    <span className="text-xs font-bold text-white mt-1">{p.name.split(' ')[1] || p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">OVR {p.rating}</span>
                  </div>
                ))}
            </div>

            {/* Midfielders row */}
            <div className="flex justify-around items-center mb-10">
              {activeSquad.players
                .filter((p) => p.position === 'MID')
                .map((p) => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center font-bold text-xs shadow-pitch-glow">
                      {p.jersey}
                    </div>
                    <span className="text-xs font-bold text-white mt-1">{p.name.split(' ')[1] || p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">OVR {p.rating}</span>
                  </div>
                ))}
            </div>

            {/* Defenders row */}
            <div className="flex justify-around items-center mb-10">
              {activeSquad.players
                .filter((p) => p.position === 'DEF')
                .map((p) => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-500 text-blue-400 flex items-center justify-center font-bold text-xs shadow-pitch-glow">
                      {p.jersey}
                    </div>
                    <span className="text-xs font-bold text-white mt-1">{p.name.split(' ')[1] || p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">OVR {p.rating}</span>
                  </div>
                ))}
            </div>

            {/* Goalkeeper row */}
            <div className="flex justify-center items-center">
              {activeSquad.players
                .filter((p) => p.position === 'GK')
                .map((p) => (
                  <div key={p.id} className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center font-bold text-xs shadow-pitch-glow">
                      {p.jersey}
                    </div>
                    <span className="text-xs font-bold text-white mt-1">{p.name.split(' ')[1] || p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">OVR {p.rating}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Squad Roster Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-pitch-border bg-pitch-darker">
          <h4 className="text-sm font-bold text-white">Full Squad Roster</h4>
          <p className="text-xs text-slate-400">
            Player salary caps, contract values, and leadership roles.
          </p>
        </div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-pitch-border bg-pitch-darker/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Player</th>
              <th className="py-3 px-4">Pos</th>
              <th className="py-3 px-4">OVR</th>
              <th className="py-3 px-4">Nationality</th>
              <th className="py-3 px-4">Squad Role</th>
              <th className="py-3 px-4 text-right">Draft Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pitch-border/50">
            {activeSquad.players.map((p) => (
              <tr key={p.id} className="hover:bg-pitch-cardHover transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                  #{p.jersey}
                </td>
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                  <span>{p.name}</span>
                  {p.role === 'Captain' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      (C)
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 font-semibold text-emerald-400">{p.position}</td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-white">{p.rating}</td>
                <td className="py-3.5 px-4 text-slate-300">{p.nationality}</td>
                <td className="py-3.5 px-4">
                  <Badge variant={p.role === 'Captain' ? 'yellow' : 'slate'} size="sm">
                    {p.role}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                  ${p.acquiredPrice.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
