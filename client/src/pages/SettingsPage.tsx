import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useHealthCheck } from '../hooks/useHealthCheck';
import {
  Server,
  Sliders,
  Save,
  RotateCw,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { health, loading: healthLoading, refresh: refreshHealth } = useHealthCheck();

  const [leagueName, setLeagueName] = useState('Premier Football League');
  const [seasonCode, setSeasonCode] = useState('2026/27');
  const [purseCap, setPurseCap] = useState('1500000');
  const [minBidIncrement, setMinBidIncrement] = useState('20000');
  const [hammerCountdown, setHammerCountdown] = useState('30');
  const [maxSquadSize, setMaxSquadSize] = useState('15');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('League & Auction parameters saved successfully!');
  };

  const isDbConnected = health?.database?.status === 'connected';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-pitch-card border border-orange-500/50 shadow-pitch-glow text-xs text-white flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-orange-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>System & League Settings</span>
            <Badge variant="slate" size="sm">
              Admin Access
            </Badge>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure financial rules, auction countdown constraints, and server connection telemetry.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleSaveSettings} icon={Save}>
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Config Forms (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General League Config */}
          <Card glow className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-pitch-border pb-3">
              <Sliders className="w-4 h-4 text-orange-400" />
              Championship Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Championship Name</label>
                <input
                  type="text"
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Season Code</label>
                <input
                  type="text"
                  value={seasonCode}
                  onChange={(e) => setSeasonCode(e.target.value)}
                  className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Franchise Purse Cap ($ USD)</label>
                <input
                  type="number"
                  value={purseCap}
                  onChange={(e) => setPurseCap(e.target.value)}
                  className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Max Squad Capacity</label>
                <input
                  type="number"
                  value={maxSquadSize}
                  onChange={(e) => setMaxSquadSize(e.target.value)}
                  className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>
          </Card>

          {/* Live Auction Rules */}
          <Card glow className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-pitch-border pb-3">
              <Sliders className="w-4 h-4 text-orange-400" />
              Live Auction Engine Settings (Phase 1 Baseline)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Minimum Bid Increment ($ USD)</label>
                <input
                  type="number"
                  value={minBidIncrement}
                  onChange={(e) => setMinBidIncrement(e.target.value)}
                  className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Hammer Clock Timer (Seconds)</label>
                <input
                  type="number"
                  value={hammerCountdown}
                  onChange={(e) => setHammerCountdown(e.target.value)}
                  className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Connection Diagnostics (1 col) */}
        <div className="space-y-6">
          <Card glow className="space-y-4">
            <div className="flex items-center justify-between border-b border-pitch-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-orange-400" />
                Backend Telemetry
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshHealth}
                isLoading={healthLoading}
                icon={RotateCw}
              >
                Test
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-pitch-darker border border-pitch-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">API Status:</span>
                  <Badge variant={health?.status === 'ok' ? 'green' : 'red'} size="sm" dot>
                    {health?.status === 'ok' ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Endpoint: /api/health
                </div>
              </div>

              <div className="p-3 rounded-xl bg-pitch-darker border border-pitch-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">MongoDB Connection:</span>
                  <Badge variant={isDbConnected ? 'green' : 'yellow'} size="sm" dot>
                    {health?.database?.status || 'disconnected'}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate">
                  URI: mongodb://127.0.0.1:27017/football_league
                </div>
              </div>

              <div className="p-3 rounded-xl bg-pitch-darker border border-pitch-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Process Uptime:</span>
                  <span className="font-mono text-orange-400 font-bold">
                    {health?.uptimeSeconds || 0} seconds
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Node Engine:</span>
                  <span className="font-mono text-slate-300">
                    {health?.system?.nodeVersion || 'v20+'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
