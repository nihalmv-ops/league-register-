import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { SearchBar } from '../components/common/SearchBar';
import { Fixture } from '../types/football';
import { Calendar, MapPin } from 'lucide-react';

const mockFixtures: Fixture[] = [
  {
    id: 'fix-1',
    matchNumber: 1,
    round: 'Matchday 1',
    homeTeam: 'Thunder Strikers FC',
    homeTeamCode: 'TSFC',
    homeTeamColor: '#10b981',
    awayTeam: 'Apex Predators',
    awayTeamCode: 'APEX',
    awayTeamColor: '#ef4444',
    date: '2026-11-28',
    time: '20:00 GMT',
    venue: 'Thunder Arena, Manchester',
    status: 'scheduled',
    referee: 'Michael Oliver',
  },
  {
    id: 'fix-2',
    matchNumber: 2,
    round: 'Matchday 1',
    homeTeam: 'Metro City United',
    homeTeamCode: 'MCU',
    homeTeamColor: '#3b82f6',
    awayTeam: 'Red Dragons SC',
    awayTeamCode: 'RDSC',
    awayTeamColor: '#dc2626',
    date: '2026-11-29',
    time: '15:00 GMT',
    venue: 'Metro Grand Park, Birmingham',
    status: 'scheduled',
    referee: 'Anthony Taylor',
  },
  {
    id: 'fix-3',
    matchNumber: 3,
    round: 'Matchday 1',
    homeTeam: 'Emerald Warriors',
    homeTeamCode: 'EWAR',
    homeTeamColor: '#059669',
    awayTeam: 'Coastal Vipers FC',
    awayTeamCode: 'CVFC',
    awayTeamColor: '#8b5cf6',
    date: '2026-11-29',
    time: '17:30 GMT',
    venue: 'Celtic Way Arena, Dublin',
    status: 'scheduled',
    referee: 'Clément Turpin',
  },
  {
    id: 'fix-4',
    matchNumber: 4,
    round: 'Matchday 1',
    homeTeam: 'Northern Wolves',
    homeTeamCode: 'NWFC',
    homeTeamColor: '#f59e0b',
    awayTeam: 'Golden Eagles SC',
    awayTeamCode: 'GESC',
    awayTeamColor: '#eab308',
    date: '2026-11-30',
    time: '20:00 GMT',
    venue: 'Highland Fortress, Newcastle',
    status: 'scheduled',
    referee: 'Szymon Marciniak',
  },
  {
    id: 'fix-5',
    matchNumber: 5,
    round: 'Matchday 2',
    homeTeam: 'Apex Predators',
    homeTeamCode: 'APEX',
    homeTeamColor: '#ef4444',
    awayTeam: 'Metro City United',
    awayTeamCode: 'MCU',
    awayTeamColor: '#3b82f6',
    date: '2026-12-05',
    time: '15:00 GMT',
    venue: 'Olympus Stadium, London',
    status: 'scheduled',
  },
  {
    id: 'fix-6',
    matchNumber: 6,
    round: 'Matchday 2',
    homeTeam: 'Red Dragons SC',
    homeTeamCode: 'RDSC',
    homeTeamColor: '#dc2626',
    awayTeam: 'Thunder Strikers FC',
    awayTeamCode: 'TSFC',
    awayTeamColor: '#10b981',
    date: '2026-12-05',
    time: '17:30 GMT',
    venue: 'Dragon Peak Ground, Cardiff',
    status: 'scheduled',
  },
];

export const FixturesPage: React.FC = () => {
  const [selectedRound, setSelectedRound] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFixtures = mockFixtures.filter((f) => {
    const matchesRound = selectedRound === 'ALL' || f.round === selectedRound;
    const matchesSearch =
      f.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.venue.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRound && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>League Fixtures & Match Calendar</span>
            <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
              Season 2026-27 Schedule
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Round-robin tournament fixtures, stadium assignments, and kick-off timetables.
          </p>
        </div>

        <Badge variant="orange" size="md">
          {mockFixtures.length} Matches Programmed
        </Badge>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="sm" className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search franchise or venue..."
            className="flex-1"
          />

          <div className="flex items-center gap-1">
            {['ALL', 'Matchday 1', 'Matchday 2'].map((rd) => (
              <button
                key={rd}
                onClick={() => setSelectedRound(rd)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedRound === rd
                    ? 'bg-football-accent text-slate-950 font-bold shadow-pitch-glow'
                    : 'bg-pitch-darker text-slate-400 hover:text-white border border-pitch-border'
                }`}
              >
                {rd}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Fixtures List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFixtures.map((fixture) => (
          <Card key={fixture.id} hover glow className="space-y-4">
            {/* Top Bar: Match # and Status */}
            <div className="flex items-center justify-between border-b border-pitch-border/60 pb-3 text-xs">
              <span className="font-bold text-orange-400 font-mono">
                Match #{fixture.matchNumber} • {fixture.round}
              </span>
              <Badge variant="blue" size="sm">
                Scheduled
              </Badge>
            </div>

            {/* Match Teams Clash Display */}
            <div className="flex items-center justify-between py-2">
              {/* Home Team */}
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[10px] font-mono text-orange-400 block mb-0.5">
                  HOME
                </span>
                <h4 className="text-base font-extrabold text-white">{fixture.homeTeam}</h4>
                <span className="text-xs font-mono text-slate-400 font-bold">
                  {fixture.homeTeamCode}
                </span>
              </div>

              {/* VS Pill */}
              <div className="px-3 py-1.5 rounded-xl bg-pitch-darker border border-pitch-border text-center">
                <span className="text-xs font-black text-amber-400 block">VS</span>
                <span className="text-[10px] font-mono text-slate-400">{fixture.time}</span>
              </div>

              {/* Away Team */}
              <div className="flex-1 text-center sm:text-right">
                <span className="text-[10px] font-mono text-rose-400 block mb-0.5">
                  AWAY
                </span>
                <h4 className="text-base font-extrabold text-white">{fixture.awayTeam}</h4>
                <span className="text-xs font-mono text-slate-400 font-bold">
                  {fixture.awayTeamCode}
                </span>
              </div>
            </div>

            {/* Footer Logistics */}
            <div className="pt-3 border-t border-pitch-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{fixture.date}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{fixture.venue}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
