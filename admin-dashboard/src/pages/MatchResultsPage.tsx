import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { MatchResult } from '../types/football';
import { Award, MapPin, Calendar, Eye } from 'lucide-react';

const mockResults: MatchResult[] = [
  {
    id: 'res-1',
    matchNumber: 101,
    date: '2026-11-12',
    venue: 'National Arena, London',
    homeTeam: 'Thunder Strikers FC',
    homeTeamCode: 'TSFC',
    awayTeam: 'Apex Predators',
    awayTeamCode: 'APEX',
    homeScore: 3,
    awayScore: 1,
    scorers: [
      { player: 'Mateo Rossi', team: 'TSFC', minute: 14 },
      { player: 'Kofi Mensah', team: 'APEX', minute: 38 },
      { player: 'Julian Draxler', team: 'TSFC', minute: 61 },
      { player: 'Mateo Rossi', team: 'TSFC', minute: 88 },
    ],
    manOfTheMatch: 'Mateo Rossi (TSFC)',
    attendance: 44250,
    highlightSummary:
      'Thunder Strikers delivered a masterclass in counter-pressing, led by Mateo Rossi’s sensational brace and Julian Draxler’s 25-yard curling free-kick.',
  },
  {
    id: 'res-2',
    matchNumber: 102,
    date: '2026-11-13',
    venue: 'Metro Grand Park, Birmingham',
    homeTeam: 'Metro City United',
    homeTeamCode: 'MCU',
    awayTeam: 'Red Dragons SC',
    awayTeamCode: 'RDSC',
    homeScore: 2,
    awayScore: 2,
    scorers: [
      { player: 'Arthur Pendelton', team: 'MCU', minute: 23 },
      { player: 'Gareth Thomas Jr.', team: 'RDSC', minute: 45 },
      { player: 'David Henderson Jr.', team: 'MCU', minute: 71 },
      { player: 'Rhys Davies', team: 'RDSC', minute: 89 },
    ],
    manOfTheMatch: 'Rhys Davies (RDSC)',
    attendance: 38100,
    highlightSummary:
      'A thrilling 4-goal derby ended in shared points after an 89th-minute equalizer from Red Dragons outside the penalty box.',
  },
  {
    id: 'res-3',
    matchNumber: 103,
    date: '2026-11-14',
    venue: 'Celtic Way Arena, Dublin',
    homeTeam: 'Emerald Warriors',
    homeTeamCode: 'EWAR',
    awayTeam: 'Northern Wolves',
    awayTeamCode: 'NWFC',
    homeScore: 1,
    awayScore: 0,
    scorers: [{ player: 'Sean O’Connor', team: 'EWAR', minute: 54 }],
    manOfTheMatch: 'Sean O’Connor (EWAR)',
    attendance: 41000,
    highlightSummary:
      'A tightly contested tactical defensive battle won by a solitary headed goal from a corner set piece.',
  },
];

export const MatchResultsPage: React.FC = () => {
  const [selectedResult, setSelectedResult] = useState<MatchResult | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Match Results & Performance Audit</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Pre-Season & Exhibition Scores
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Verified full-time scorelines, goal events, and player of the match honors.
          </p>
        </div>

        <Badge variant="green" size="md">
          {mockResults.length} Completed Matches
        </Badge>
      </div>

      {/* Results Cards List */}
      <div className="space-y-4">
        {mockResults.map((result) => (
          <Card
            key={result.id}
            hover
            glow
            className="cursor-pointer space-y-4"
            onClick={() => setSelectedResult(result)}
          >
            {/* Header: Date & Venue */}
            <div className="flex items-center justify-between border-b border-pitch-border/60 pb-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{result.date}</span>
                <span>•</span>
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{result.venue}</span>
              </div>
              <Badge variant="slate" size="sm">
                Full Time (FT)
              </Badge>
            </div>

            {/* Scoreline Clash Board */}
            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 py-2 text-center sm:text-left">
              {/* Home Team */}
              <div className="flex items-center sm:justify-start justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pitch-darker border border-pitch-border flex items-center justify-center font-bold text-xs text-emerald-400">
                  {result.homeTeamCode}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">{result.homeTeam}</h4>
                  <span className="text-xs text-slate-400 font-mono">Home</span>
                </div>
              </div>

              {/* Score Display */}
              <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-white font-mono">
                    {result.homeScore}
                  </span>
                  <span className="text-xl font-bold text-slate-600">-</span>
                  <span className="text-3xl font-black text-white font-mono">
                    {result.awayScore}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 mt-1">
                  OFFICIAL RESULT
                </span>
              </div>

              {/* Away Team */}
              <div className="flex items-center sm:justify-end justify-center gap-3 text-right">
                <div>
                  <h4 className="text-base font-extrabold text-white">{result.awayTeam}</h4>
                  <span className="text-xs text-slate-400 font-mono">Away</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-pitch-darker border border-pitch-border flex items-center justify-center font-bold text-xs text-rose-400">
                  {result.awayTeamCode}
                </div>
              </div>
            </div>

            {/* Scorers & MOTM summary strip */}
            <div className="pt-3 border-t border-pitch-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 text-[11px]">Scorers:</span>
                {result.scorers.map((s, idx) => (
                  <span key={idx} className="font-mono text-slate-300">
                    {s.player} {s.minute}'
                    {idx < result.scorers.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  MOTM: {result.manOfTheMatch}
                </span>
                <Button variant="ghost" size="sm" icon={Eye}>
                  Report
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Match Report Detail Modal */}
      <Modal
        isOpen={!!selectedResult}
        onClose={() => setSelectedResult(null)}
        title={`${selectedResult?.homeTeam} vs ${selectedResult?.awayTeam}`}
        subtitle={`Match #${selectedResult?.matchNumber} • ${selectedResult?.date}`}
        maxWidth="lg"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setSelectedResult(null)}>
            Close Report
          </Button>
        }
      >
        {selectedResult && (
          <div className="space-y-4 text-xs">
            {/* Score header */}
            <div className="p-4 rounded-xl bg-pitch-dark border border-pitch-border text-center">
              <div className="text-3xl font-black text-white font-mono mb-1">
                {selectedResult.homeScore} - {selectedResult.awayScore}
              </div>
              <p className="text-xs text-slate-400">
                Full-time at {selectedResult.venue} • Attendance: {selectedResult.attendance.toLocaleString()}
              </p>
            </div>

            {/* Goal Timeline */}
            <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border space-y-3">
              <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Goal Event Timeline
              </h5>
              <div className="space-y-2">
                {selectedResult.scorers.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-pitch-dark border border-pitch-border"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        ⚽
                      </span>
                      <span className="font-bold text-white">{s.player}</span>
                      <span className="text-[10px] text-slate-400">({s.team})</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">{s.minute}'</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Match Summary Narrative */}
            <div className="p-4 rounded-xl bg-pitch-card border border-pitch-border space-y-1.5">
              <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Commissioner & Scout Match Summary
              </h5>
              <p className="text-slate-300 leading-relaxed text-xs">
                {selectedResult.highlightSummary}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
