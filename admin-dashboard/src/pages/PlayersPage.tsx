import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { SearchBar } from '../components/common/SearchBar';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { Player, PlayerPosition, PlayerTier, AuctionStatus } from '../types/football';
import {
  Users,
  Grid,
  List,
  Crosshair,
  Compass,
  Shield,
  ShieldAlert,
} from 'lucide-react';

const mockPlayers: Player[] = [
  {
    id: 'p-1',
    name: 'Mateo Rossi',
    jerseyNumber: 10,
    position: 'FWD',
    tier: 'Platinum',
    age: 24,
    nationality: 'Argentina',
    currentClub: 'Buenos Aires Athletic',
    basePrice: 200000,
    soldPrice: 380000,
    teamId: 't-1',
    teamName: 'Thunder Strikers FC',
    auctionStatus: 'sold',
    overallRating: 88,
    stats: { pace: 91, shooting: 89, passing: 84, dribbling: 90, defending: 42, physical: 76 },
    preferredFoot: 'Left',
    matchesPlayed: 32,
    goals: 26,
    assists: 11,
    registeredDate: '2026-10-14',
  },
  {
    id: 'p-2',
    name: 'Julian Draxler',
    jerseyNumber: 8,
    position: 'MID',
    tier: 'Platinum',
    age: 26,
    nationality: 'Germany',
    currentClub: 'Munich Dynamics',
    basePrice: 180000,
    soldPrice: 310000,
    teamId: 't-2',
    teamName: 'Apex Predators',
    auctionStatus: 'sold',
    overallRating: 86,
    stats: { pace: 80, shooting: 82, passing: 91, dribbling: 87, defending: 68, physical: 79 },
    preferredFoot: 'Right',
    matchesPlayed: 38,
    goals: 12,
    assists: 18,
    registeredDate: '2026-10-18',
  },
  {
    id: 'p-3',
    name: 'Tariq Al-Mansoor',
    jerseyNumber: 4,
    position: 'DEF',
    tier: 'Gold',
    age: 27,
    nationality: 'Morocco',
    currentClub: 'Atlas Lions',
    basePrice: 140000,
    soldPrice: 220000,
    teamId: 't-3',
    teamName: 'Metro City United',
    auctionStatus: 'sold',
    overallRating: 84,
    stats: { pace: 82, shooting: 50, passing: 75, dribbling: 71, defending: 88, physical: 89 },
    preferredFoot: 'Right',
    matchesPlayed: 40,
    goals: 4,
    assists: 3,
    registeredDate: '2026-10-21',
  },
  {
    id: 'p-4',
    name: 'Alexander Lindqvist',
    jerseyNumber: 1,
    position: 'GK',
    tier: 'Gold',
    age: 28,
    nationality: 'Sweden',
    currentClub: 'Nordic Titans',
    basePrice: 130000,
    soldPrice: 190000,
    teamId: 't-4',
    teamName: 'Red Dragons SC',
    auctionStatus: 'sold',
    overallRating: 83,
    stats: { pace: 55, shooting: 30, passing: 78, dribbling: 50, defending: 86, physical: 82 },
    preferredFoot: 'Right',
    matchesPlayed: 34,
    goals: 0,
    assists: 1,
    cleanSheets: 14,
    registeredDate: '2026-10-24',
  },
  {
    id: 'p-5',
    name: 'Kofi Mensah',
    jerseyNumber: 7,
    position: 'FWD',
    tier: 'Gold',
    age: 21,
    nationality: 'Ghana',
    currentClub: 'Accra Stars',
    basePrice: 120000,
    auctionStatus: 'upcoming',
    overallRating: 81,
    stats: { pace: 94, shooting: 80, passing: 74, dribbling: 85, defending: 38, physical: 72 },
    preferredFoot: 'Right',
    matchesPlayed: 28,
    goals: 19,
    assists: 7,
    registeredDate: '2026-11-01',
  },
  {
    id: 'p-6',
    name: 'Lucas Ferreira',
    jerseyNumber: 6,
    position: 'MID',
    tier: 'Gold',
    age: 23,
    nationality: 'Brazil',
    currentClub: 'Santos Porto',
    basePrice: 130000,
    auctionStatus: 'upcoming',
    overallRating: 82,
    stats: { pace: 78, shooting: 76, passing: 86, dribbling: 84, defending: 74, physical: 77 },
    preferredFoot: 'Both',
    matchesPlayed: 31,
    goals: 8,
    assists: 14,
    registeredDate: '2026-11-04',
  },
  {
    id: 'p-7',
    name: 'Liam Gallagher',
    jerseyNumber: 5,
    position: 'DEF',
    tier: 'Silver',
    age: 25,
    nationality: 'Ireland',
    currentClub: 'Dublin Rovers',
    basePrice: 80000,
    auctionStatus: 'upcoming',
    overallRating: 78,
    stats: { pace: 73, shooting: 45, passing: 70, dribbling: 66, defending: 81, physical: 84 },
    preferredFoot: 'Left',
    matchesPlayed: 29,
    goals: 2,
    assists: 1,
    registeredDate: '2026-11-08',
  },
  {
    id: 'p-8',
    name: 'Kenji Takahashi',
    jerseyNumber: 11,
    position: 'FWD',
    tier: 'Silver',
    age: 22,
    nationality: 'Japan',
    currentClub: 'Tokyo Frontale',
    basePrice: 85000,
    auctionStatus: 'unsold',
    overallRating: 77,
    stats: { pace: 89, shooting: 76, passing: 72, dribbling: 81, defending: 44, physical: 68 },
    preferredFoot: 'Right',
    matchesPlayed: 26,
    goals: 11,
    assists: 6,
    registeredDate: '2026-11-09',
  },
];

export const PlayersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const filteredPlayers = mockPlayers.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.currentClub && p.currentClub.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPosition = positionFilter === 'ALL' || p.position === positionFilter;
    const matchesTier = tierFilter === 'ALL' || p.tier === tierFilter;
    const matchesStatus = statusFilter === 'ALL' || p.auctionStatus === statusFilter;

    return matchesSearch && matchesPosition && matchesTier && matchesStatus;
  });

  const getPositionIcon = (pos: PlayerPosition) => {
    switch (pos) {
      case 'FWD':
        return <Crosshair className="w-3.5 h-3.5 text-rose-400" />;
      case 'MID':
        return <Compass className="w-3.5 h-3.5 text-emerald-400" />;
      case 'DEF':
        return <Shield className="w-3.5 h-3.5 text-blue-400" />;
      case 'GK':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getTierBadge = (tier: PlayerTier) => {
    switch (tier) {
      case 'Platinum':
        return <Badge variant="purple" size="sm">Platinum Tier</Badge>;
      case 'Gold':
        return <Badge variant="yellow" size="sm">Gold Tier</Badge>;
      case 'Silver':
        return <Badge variant="slate" size="sm">Silver Tier</Badge>;
      case 'Bronze':
        return <Badge variant="slate" size="sm">Bronze Tier</Badge>;
    }
  };

  const getStatusBadge = (status: AuctionStatus) => {
    switch (status) {
      case 'sold':
        return <Badge variant="green" size="sm" dot>Sold</Badge>;
      case 'upcoming':
        return <Badge variant="blue" size="sm">In Auction Pool</Badge>;
      case 'unsold':
        return <Badge variant="red" size="sm">Unsold / Re-auction</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Player Roster & Auction Pool</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {filteredPlayers.length} / {mockPlayers.length} Loaded
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Verified players cataloged for franchise bidding and squad drafting.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-pitch-darker p-1 rounded-xl border border-pitch-border">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Table view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="sm" className="space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search player name, nationality, club..."
            className="flex-1"
          />

          {/* Position Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            {['ALL', 'FWD', 'MID', 'DEF', 'GK'].map((pos) => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  positionFilter === pos
                    ? 'bg-football-accent text-slate-950 font-bold shadow-pitch-glow'
                    : 'bg-pitch-darker text-slate-400 hover:text-white border border-pitch-border'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1">
            {['ALL', 'sold', 'upcoming', 'unsold'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-pitch-card text-emerald-400 border border-emerald-500/40'
                    : 'bg-pitch-darker text-slate-400 hover:text-white border border-pitch-border'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {filteredPlayers.length === 0 ? (
        <EmptyState
          title="No players found"
          description="Try broadening your search term or adjusting the position/tier filter criteria."
          icon={Users}
          actionText="Reset All Filters"
          onAction={() => {
            setSearchTerm('');
            setPositionFilter('ALL');
            setTierFilter('ALL');
            setStatusFilter('ALL');
          }}
        />
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.map((player) => (
            <Card
              key={player.id}
              hover
              glow
              className="cursor-pointer flex flex-col justify-between group"
              onClick={() => setSelectedPlayer(player)}
            >
              <div>
                {/* Card Top: Overall Rating & Tier */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-pitch-darker border border-pitch-border flex items-center justify-center font-black text-sm text-emerald-400 group-hover:border-emerald-500/50 group-hover:shadow-pitch-glow transition-all">
                      {player.overallRating}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-200">
                        {getPositionIcon(player.position)}
                        <span>{player.position}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {player.nationality}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(player.auctionStatus)}
                </div>

                {/* Player Name and Club */}
                <h3 className="text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors truncate">
                  {player.name}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  {player.currentClub || 'Free Agent'} • Age {player.age}
                </p>

                {/* FIFA-style Stat Badges */}
                <div className="grid grid-cols-3 gap-1.5 mt-4 py-2 border-y border-pitch-border/50 text-[11px] font-mono">
                  <div className="bg-pitch-darker/80 p-1 rounded-lg text-center">
                    <span className="text-slate-400 block text-[9px]">PAC</span>
                    <span className="font-bold text-slate-200">{player.stats.pace}</span>
                  </div>
                  <div className="bg-pitch-darker/80 p-1 rounded-lg text-center">
                    <span className="text-slate-400 block text-[9px]">SHO</span>
                    <span className="font-bold text-slate-200">{player.stats.shooting}</span>
                  </div>
                  <div className="bg-pitch-darker/80 p-1 rounded-lg text-center">
                    <span className="text-slate-400 block text-[9px]">PAS</span>
                    <span className="font-bold text-slate-200">{player.stats.passing}</span>
                  </div>
                  <div className="bg-pitch-darker/80 p-1 rounded-lg text-center">
                    <span className="text-slate-400 block text-[9px]">DRI</span>
                    <span className="font-bold text-slate-200">{player.stats.dribbling}</span>
                  </div>
                  <div className="bg-pitch-darker/80 p-1 rounded-lg text-center">
                    <span className="text-slate-400 block text-[9px]">DEF</span>
                    <span className="font-bold text-slate-200">{player.stats.defending}</span>
                  </div>
                  <div className="bg-pitch-darker/80 p-1 rounded-lg text-center">
                    <span className="text-slate-400 block text-[9px]">PHY</span>
                    <span className="font-bold text-slate-200">{player.stats.physical}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Pricing & Team */}
              <div className="mt-4 pt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    {player.auctionStatus === 'sold' ? 'Sold Price' : 'Base Price'}
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    ${(player.soldPrice || player.basePrice).toLocaleString()}
                  </span>
                </div>

                {player.teamName ? (
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20 truncate max-w-[110px]">
                    {player.teamName}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 bg-pitch-darker px-2 py-0.5 rounded-lg border border-pitch-border">
                    Pool Draft
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card className="overflow-hidden" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-pitch-border bg-pitch-darker text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">OVR</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Sold Price</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pitch-border/50">
                {filteredPlayers.map((player) => (
                  <tr
                    key={player.id}
                    className="hover:bg-pitch-cardHover transition-colors cursor-pointer"
                    onClick={() => setSelectedPlayer(player)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{player.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {player.nationality} • Age {player.age}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        {getPositionIcon(player.position)}
                        <span>{player.position}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-emerald-400 font-mono">
                        {player.overallRating}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getTierBadge(player.tier)}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      ${player.basePrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {player.soldPrice ? `$${player.soldPrice.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {player.teamName ? (
                        <span className="text-purple-400 font-semibold">{player.teamName}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(player.auctionStatus)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlayer(player);
                        }}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Player Detail Modal */}
      <Modal
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        title={selectedPlayer?.name || 'Player Profile'}
        subtitle={`${selectedPlayer?.position} • ${selectedPlayer?.nationality} • ${selectedPlayer?.currentClub || 'Free Agent'}`}
        maxWidth="lg"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setSelectedPlayer(null)}>
            Close Profile
          </Button>
        }
      >
        {selectedPlayer && (
          <div className="space-y-5">
            {/* Header profile highlights */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-pitch-dark border border-pitch-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-black text-xl text-emerald-400 shadow-pitch-glow">
                  {selectedPlayer.overallRating}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {selectedPlayer.name}
                    {getTierBadge(selectedPlayer.tier)}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Preferred Foot: {selectedPlayer.preferredFoot} • Matches: {selectedPlayer.matchesPlayed}
                  </p>
                </div>
              </div>
              {getStatusBadge(selectedPlayer.auctionStatus)}
            </div>

            {/* Financials */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                <span className="text-slate-400 text-[11px] block">Auction Base Price</span>
                <span className="text-base font-extrabold text-slate-200 font-mono">
                  ${selectedPlayer.basePrice.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-pitch-card border border-pitch-border">
                <span className="text-slate-400 text-[11px] block">Drafted / Sold Value</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {selectedPlayer.soldPrice
                    ? `$${selectedPlayer.soldPrice.toLocaleString()}`
                    : 'Awaiting Auction Stage'}
                </span>
              </div>
            </div>

            {/* In-depth Skill Metrics */}
            <div>
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Technical & Physical Ratings
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedPlayer.stats).map(([stat, val]) => (
                  <div
                    key={stat}
                    className="p-2.5 rounded-lg bg-pitch-dark border border-pitch-border flex items-center justify-between"
                  >
                    <span className="uppercase font-semibold text-slate-400 text-[11px]">
                      {stat}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{val}</span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Record */}
            <div className="p-3 rounded-xl bg-pitch-dark border border-pitch-border flex justify-around text-center text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Matches</span>
                <span className="font-bold text-white text-sm">{selectedPlayer.matchesPlayed}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Goals</span>
                <span className="font-bold text-emerald-400 text-sm">{selectedPlayer.goals}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Assists</span>
                <span className="font-bold text-blue-400 text-sm">{selectedPlayer.assists}</span>
              </div>
              {selectedPlayer.cleanSheets !== undefined && (
                <div>
                  <span className="text-slate-400 text-[10px] block">Clean Sheets</span>
                  <span className="font-bold text-amber-400 text-sm">
                    {selectedPlayer.cleanSheets}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
