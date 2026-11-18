import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SearchBar } from '../components/common/SearchBar';
import { Modal } from '../components/common/Modal';
import { Team } from '../types/football';
import {
  MapPin,
  Trophy,
  Users,
  ChevronRight,
} from 'lucide-react';

const mockTeams: Team[] = [
  {
    id: 't-1',
    name: 'Thunder Strikers FC',
    shortCode: 'TSFC',
    city: 'Manchester',
    stadium: 'Thunder Arena (Capacity: 45,000)',
    manager: 'Erik Veldman',
    owner: 'Marcus Sterling Holdings',
    primaryColor: '#10b981',
    secondaryColor: '#064e3b',
    totalBudget: 1500000,
    spentBudget: 940000,
    remainingBudget: 560000,
    squadCount: 7,
    maxSquadSize: 15,
    trophiesWon: 4,
    foundedYear: 2018,
    logoBadge: '⚡',
  },
  {
    id: 't-2',
    name: 'Apex Predators',
    shortCode: 'APEX',
    city: 'London',
    stadium: 'Olympus Stadium (Capacity: 52,000)',
    manager: 'Carlos Moretti',
    owner: 'Apex Global Sports',
    primaryColor: '#ef4444',
    secondaryColor: '#7f1d1d',
    totalBudget: 1500000,
    spentBudget: 810000,
    remainingBudget: 690000,
    squadCount: 6,
    maxSquadSize: 15,
    trophiesWon: 2,
    foundedYear: 2019,
    logoBadge: '🦅',
  },
  {
    id: 't-3',
    name: 'Metro City United',
    shortCode: 'MCU',
    city: 'Birmingham',
    stadium: 'Metro Grand Park (Capacity: 40,000)',
    manager: 'David Henderson',
    owner: 'Midlands Capital Group',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e3a8a',
    totalBudget: 1500000,
    spentBudget: 1120000,
    remainingBudget: 380000,
    squadCount: 8,
    maxSquadSize: 15,
    trophiesWon: 5,
    foundedYear: 2015,
    logoBadge: '🏙️',
  },
  {
    id: 't-4',
    name: 'Red Dragons SC',
    shortCode: 'RDSC',
    city: 'Cardiff',
    stadium: 'Dragon Peak Ground (Capacity: 38,000)',
    manager: 'Gareth Thomas',
    owner: 'Welsh Heritage Sports',
    primaryColor: '#dc2626',
    secondaryColor: '#991b1b',
    totalBudget: 1500000,
    spentBudget: 750000,
    remainingBudget: 750000,
    squadCount: 5,
    maxSquadSize: 15,
    trophiesWon: 1,
    foundedYear: 2020,
    logoBadge: '🐉',
  },
  {
    id: 't-5',
    name: 'Emerald Warriors',
    shortCode: 'EWAR',
    city: 'Dublin',
    stadium: 'Celtic Way Arena (Capacity: 42,000)',
    manager: 'Sean O’Connor',
    owner: 'Emerald Ventures',
    primaryColor: '#059669',
    secondaryColor: '#022c22',
    totalBudget: 1500000,
    spentBudget: 620000,
    remainingBudget: 880000,
    squadCount: 5,
    maxSquadSize: 15,
    trophiesWon: 3,
    foundedYear: 2017,
    logoBadge: '☘️',
  },
  {
    id: 't-6',
    name: 'Coastal Vipers FC',
    shortCode: 'CVFC',
    city: 'Southampton',
    stadium: 'Harbor Field (Capacity: 35,000)',
    manager: 'Nathan Cross',
    owner: 'Solent Marine Group',
    primaryColor: '#8b5cf6',
    secondaryColor: '#4c1d95',
    totalBudget: 1500000,
    spentBudget: 490000,
    remainingBudget: 1010000,
    squadCount: 4,
    maxSquadSize: 15,
    trophiesWon: 0,
    foundedYear: 2021,
    logoBadge: '🐍',
  },
  {
    id: 't-7',
    name: 'Northern Wolves',
    shortCode: 'NWFC',
    city: 'Newcastle',
    stadium: 'Highland Fortress (Capacity: 48,000)',
    manager: 'Duncan McLeod',
    owner: 'Highland Sports Trust',
    primaryColor: '#f59e0b',
    secondaryColor: '#78350f',
    totalBudget: 1500000,
    spentBudget: 450000,
    remainingBudget: 1050000,
    squadCount: 4,
    maxSquadSize: 15,
    trophiesWon: 2,
    foundedYear: 2016,
    logoBadge: '🐺',
  },
  {
    id: 't-8',
    name: 'Golden Eagles SC',
    shortCode: 'GESC',
    city: 'Leeds',
    stadium: 'Sovereign Park (Capacity: 39,000)',
    manager: 'Arthur Pendelton',
    owner: 'Yorkshire Football Consortium',
    primaryColor: '#eab308',
    secondaryColor: '#713f12',
    totalBudget: 1500000,
    spentBudget: 380000,
    remainingBudget: 1120000,
    squadCount: 3,
    maxSquadSize: 15,
    trophiesWon: 1,
    foundedYear: 2022,
    logoBadge: '🦅',
  },
];

export const TeamsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const filteredTeams = mockTeams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>League Franchises & Clubs</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {mockTeams.length} Active Teams
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Official league franchises participating in the 2026-27 Auction and Championship.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">
            Salary Cap: $1.5M / Club
          </Badge>
          <Badge variant="blue" size="md">
            Roster: 15 Players Max
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card padding="sm">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search team name, city, short code..."
        />
      </Card>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredTeams.map((team) => {
          const purseUtil = Math.round((team.spentBudget / team.totalBudget) * 100);
          const rosterUtil = Math.round((team.squadCount / team.maxSquadSize) * 100);

          return (
            <Card
              key={team.id}
              hover
              glow
              className="cursor-pointer flex flex-col justify-between group"
              onClick={() => setSelectedTeam(team)}
            >
              <div>
                {/* Team Badge & Shortcode */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-pitch-darker border border-pitch-border flex items-center justify-center text-2xl group-hover:scale-110 group-hover:border-emerald-500/50 group-hover:shadow-pitch-glow transition-all">
                    {team.logoBadge}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-white bg-pitch-darker px-2 py-1 rounded-lg border border-pitch-border">
                      {team.shortCode}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-1 justify-end">
                      <Trophy className="w-3 h-3" />
                      <span>{team.trophiesWon} Titles</span>
                    </div>
                  </div>
                </div>

                {/* Team Names & City */}
                <h3 className="text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                  {team.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{team.city}</span>
                </div>

                {/* Purse Progress */}
                <div className="mt-4 p-3 rounded-xl bg-pitch-darker/70 border border-pitch-border/50 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 text-[11px]">Purse Remaining</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatCurrency(team.remainingBudget)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                      style={{ width: `${100 - purseUtil}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Spent: {formatCurrency(team.spentBudget)}</span>
                    <span>{purseUtil}% Cap</span>
                  </div>
                </div>

                {/* Squad Roster Fill */}
                <div className="mt-3 flex items-center justify-between text-xs px-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Squad Capacity
                  </span>
                  <span className="font-bold text-slate-200">
                    {team.squadCount} / {team.maxSquadSize} ({rosterUtil}%)
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-pitch-border/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">Mgr: {team.manager}</span>
                <span className="text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5 font-semibold">
                  Inspect
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Team Details Modal */}
      <Modal
        isOpen={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        title={selectedTeam?.name || 'Club Profile'}
        subtitle={`Established ${selectedTeam?.foundedYear} • ${selectedTeam?.city}`}
        maxWidth="lg"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setSelectedTeam(null)}>
            Close Overview
          </Button>
        }
      >
        {selectedTeam && (
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="p-4 rounded-xl bg-pitch-dark border border-pitch-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl p-2 rounded-xl bg-pitch-darker border border-pitch-border">
                  {selectedTeam.logoBadge}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">{selectedTeam.name}</h4>
                  <p className="text-xs text-slate-400">
                    Home: {selectedTeam.stadium}
                  </p>
                </div>
              </div>
              <Badge variant="purple" size="md">
                {selectedTeam.shortCode}
              </Badge>
            </div>

            {/* Financial Purse Overview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                <span className="text-slate-400 block text-[11px]">Total Purse Cap</span>
                <span className="text-sm font-bold text-white font-mono">
                  {formatCurrency(selectedTeam.totalBudget)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                <span className="text-slate-400 block text-[11px]">Auction Spent</span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {formatCurrency(selectedTeam.spentBudget)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                <span className="text-slate-400 block text-[11px]">Available Funds</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {formatCurrency(selectedTeam.remainingBudget)}
                </span>
              </div>
            </div>

            {/* Club Leadership */}
            <div className="p-3.5 rounded-xl bg-pitch-dark border border-pitch-border space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Head Coach / Manager:</span>
                <span className="font-bold text-white">{selectedTeam.manager}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Ownership Group:</span>
                <span className="font-semibold text-slate-200">{selectedTeam.owner}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">League Championships:</span>
                <span className="font-bold text-amber-400">{selectedTeam.trophiesWon} Cups</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Squad Slots Filled:</span>
                <span className="font-bold text-emerald-400">
                  {selectedTeam.squadCount} of {selectedTeam.maxSquadSize} Slots
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
