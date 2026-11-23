import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Gavel,
  Radio,
  Clock,
  Volume2,
  VolumeX,
  TrendingUp,
} from 'lucide-react';

export const LiveAuctionPage: React.FC = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'arena' | 'rules' | 'queue'>('arena');
  const [simulatedBid, setSimulatedBid] = useState(380000);
  const [lastBidTeam, setLastBidTeam] = useState('Thunder Strikers FC');

  const upcomingQueue = [
    { lot: 1, name: 'Mateo Rossi', position: 'FWD', rating: 88, basePrice: 200000, status: 'Active on Stage' },
    { lot: 2, name: 'Julian Draxler', position: 'MID', rating: 86, basePrice: 180000, status: 'On Deck' },
    { lot: 3, name: 'Kofi Mensah', position: 'FWD', rating: 81, basePrice: 120000, status: 'In Waiting Queue' },
    { lot: 4, name: 'Lucas Ferreira', position: 'MID', rating: 82, basePrice: 130000, status: 'In Waiting Queue' },
    { lot: 5, name: 'Liam Gallagher', position: 'DEF', rating: 78, basePrice: 80000, status: 'In Waiting Queue' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Live Stage Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-orange-950/60 via-pitch-card to-slate-900 border border-orange-500/40 shadow-pitch-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
              <Radio className="w-3 h-3 text-rose-400" />
              LIVE AUCTION ARENA PREVIEW
            </span>
            <Badge variant="yellow" size="sm">
              Phase 1 Stage Ready
            </Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Real-Time Live Player Bidding Room
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-0.5">
            Phase 1 provides the executive auction stage preview and lot queue. High-frequency
            WebSocket bidding, hammer countdowns, and automated squad purse deductions will activate in Phase 2.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            icon={soundEnabled ? Volume2 : VolumeX}
          >
            {soundEnabled ? 'Gavel Audio ON' : 'Audio Muted'}
          </Button>
        </div>
      </div>

      {/* Arena Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-pitch-border pb-2">
        <button
          onClick={() => setActiveTab('arena')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'arena'
              ? 'bg-football-accent text-slate-950 shadow-pitch-glow'
              : 'text-slate-400 hover:text-white bg-pitch-darker'
          }`}
        >
          Active Stage Podium
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'queue'
              ? 'bg-football-accent text-slate-950 shadow-pitch-glow'
              : 'text-slate-400 hover:text-white bg-pitch-darker'
          }`}
        >
          Auction Lot Queue (5 Upcoming)
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'rules'
              ? 'bg-football-accent text-slate-950 shadow-pitch-glow'
              : 'text-slate-400 hover:text-white bg-pitch-darker'
          }`}
        >
          Bidding Rules & Regulations
        </button>
      </div>

      {/* Tab 1: Stage Podium */}
      {activeTab === 'arena' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stage Spotlight Card */}
          <Card glow className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-pitch-border pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-400 animate-ping" />
                <span className="text-xs font-bold uppercase text-orange-400 tracking-wider">
                  Currently On Bidding Podium • Lot #1
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-amber-400 bg-pitch-darker px-3 py-1 rounded-xl border border-pitch-border">
                <Clock className="w-3.5 h-3.5" />
                <span>Hammer Timer: 00:24s</span>
              </div>
            </div>

            {/* Spotlight Player Showcase */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-pitch-darker via-pitch-card to-slate-900 border border-pitch-border">
              <div className="w-24 h-24 rounded-2xl bg-orange-500/10 border-2 border-orange-500/40 flex flex-col items-center justify-center font-black text-3xl text-orange-400 shadow-pitch-glow shrink-0">
                <span>88</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  FWD
                </span>
              </div>

              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <Badge variant="purple" size="sm">
                    Platinum Tier
                  </Badge>
                  <span className="text-xs text-slate-400">Argentina • Age 24</span>
                </div>
                <h3 className="text-2xl font-black text-white">Mateo Rossi</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Buenos Aires Athletic • 32 Apps • 26 Goals • 11 Assists
                </p>

                {/* Stat pills */}
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 text-[11px] font-mono">
                  <span className="px-2 py-0.5 bg-pitch-darkest rounded border border-pitch-border text-slate-300">
                    PAC 91
                  </span>
                  <span className="px-2 py-0.5 bg-pitch-darkest rounded border border-pitch-border text-slate-300">
                    SHO 89
                  </span>
                  <span className="px-2 py-0.5 bg-pitch-darkest rounded border border-pitch-border text-slate-300">
                    PAS 84
                  </span>
                  <span className="px-2 py-0.5 bg-pitch-darkest rounded border border-pitch-border text-slate-300">
                    DRI 90
                  </span>
                </div>
              </div>
            </div>

            {/* Current Highest Bid Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-pitch-darker border border-pitch-border">
                <span className="text-xs text-slate-400 block mb-1">Starting Base Price</span>
                <span className="text-xl font-extrabold text-slate-300 font-mono">
                  $200,000
                </span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Min bid increment: $20,000
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-950/60 to-pitch-darker border border-orange-500/40">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs text-orange-400 font-bold">
                    Current Highest Bid
                  </span>
                  <Badge variant="green" size="sm" dot>
                    Active Bid
                  </Badge>
                </div>
                <span className="text-2xl font-black text-white font-mono tracking-tight">
                  ${simulatedBid.toLocaleString()}
                </span>
                <span className="text-xs text-slate-300 block mt-1">
                  Held by: <strong className="text-orange-400">{lastBidTeam}</strong>
                </span>
              </div>
            </div>

            {/* Test Bidding Action Console (Demo Mode) */}
            <div className="p-4 rounded-xl bg-pitch-dark border border-pitch-border space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Phase 1 Interactive Bid Increment Simulator
                </span>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Demo Action
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSimulatedBid((prev) => prev + 20000);
                    setLastBidTeam('Thunder Strikers FC');
                  }}
                  icon={Gavel}
                >
                  Bid +$20,000 (Thunder Strikers)
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSimulatedBid((prev) => prev + 30000);
                    setLastBidTeam('Apex Predators');
                  }}
                  icon={Gavel}
                >
                  Bid +$30,000 (Apex Predators)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSimulatedBid(200000);
                    setLastBidTeam('Auctioneer Opening');
                  }}
                >
                  Reset Base
                </Button>
              </div>
            </div>
          </Card>

          {/* Right Column: Live Bid Feed */}
          <Card glow className="space-y-4">
            <div className="flex items-center justify-between border-b border-pitch-border pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                Live Bidding Activity
              </h4>
              <span className="text-[10px] font-mono text-orange-400">WebSocket Ready</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{lastBidTeam}</div>
                  <div className="text-[10px] text-slate-400">Just now • Paddle #04</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-orange-400">
                    ${simulatedBid.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-orange-400">Highest Bidder</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-pitch-darker border border-pitch-border/60 flex justify-between items-center opacity-80">
                <div>
                  <div className="font-bold text-slate-200">Apex Predators</div>
                  <div className="text-[10px] text-slate-400">12 seconds ago • Paddle #02</div>
                </div>
                <div className="font-mono font-bold text-slate-300">$350,000</div>
              </div>

              <div className="p-3 rounded-xl bg-pitch-darker border border-pitch-border/60 flex justify-between items-center opacity-60">
                <div>
                  <div className="font-bold text-slate-200">Metro City United</div>
                  <div className="text-[10px] text-slate-400">35 seconds ago • Paddle #01</div>
                </div>
                <div className="font-mono font-bold text-slate-300">$320,000</div>
              </div>

              <div className="p-3 rounded-xl bg-pitch-darker border border-pitch-border/60 flex justify-between items-center opacity-40">
                <div>
                  <div className="font-bold text-slate-200">Opening Base Lot</div>
                  <div className="text-[10px] text-slate-400">1 minute ago</div>
                </div>
                <div className="font-mono font-bold text-slate-400">$200,000</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-pitch-darker border border-pitch-border text-center text-xs text-slate-400">
              Auctioneer: <strong className="text-white">Official FA Licensed Scorer</strong>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Queue */}
      {activeTab === 'queue' && (
        <Card glow className="overflow-hidden" padding="none">
          <div className="p-4 border-b border-pitch-border bg-pitch-darker">
            <h4 className="text-sm font-bold text-white">Upcoming Auction Lots</h4>
            <p className="text-xs text-slate-400">
              Sequential order of players entering the bidding arena.
            </p>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-pitch-border text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-pitch-darker/50">
                <th className="py-3 px-4">Lot #</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Arena Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-border/50">
              {upcomingQueue.map((item) => (
                <tr key={item.lot} className="hover:bg-pitch-cardHover transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                    #{item.lot}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">{item.name}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-300">{item.position}</td>
                  <td className="py-3.5 px-4 font-mono font-black text-orange-400">
                    {item.rating}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    ${item.basePrice.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.status === 'Active on Stage'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-pitch-darker text-slate-400 border border-pitch-border'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Tab 3: Bidding Rules */}
      {activeTab === 'rules' && (
        <Card glow className="space-y-4">
          <h4 className="text-base font-extrabold text-white">
            Official League Auction Protocol
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-pitch-darker border border-pitch-border space-y-2">
              <h5 className="font-bold text-orange-400">1. Franchise Purse Ceiling</h5>
              <p className="text-slate-300 leading-relaxed">
                Every franchise starts with a strict purse ceiling of $1,500,000. Bids exceeding
                the remaining available balance will be automatically rejected by the engine.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-pitch-darker border border-pitch-border space-y-2">
              <h5 className="font-bold text-orange-400">2. Squad Composition Limits</h5>
              <p className="text-slate-300 leading-relaxed">
                Franchises must draft a minimum of 11 players and a maximum of 15 players.
                Each roster must include at least 2 Goalkeepers, 4 Defenders, 4 Midfielders, and 2 Forwards.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-pitch-darker border border-pitch-border space-y-2">
              <h5 className="font-bold text-orange-400">3. Hammer Countdown Rule</h5>
              <p className="text-slate-300 leading-relaxed">
                When a new bid is placed, the timer resets to 30 seconds. If no opposing bid is made
                within the countdown, the player is awarded to the highest bidder at the sound of the third gavel.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-pitch-darker border border-pitch-border space-y-2">
              <h5 className="font-bold text-orange-400">4. Unsold Players</h5>
              <p className="text-slate-300 leading-relaxed">
                Players with zero bids at base price are entered into the Accelerated Re-Auction Pool
                at the conclusion of the primary draft round with base price reduced by 25%.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
