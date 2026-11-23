import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Download,
  Sparkles,
  Calendar,
  MapPin,
  CheckCircle2,
  Copy,
} from 'lucide-react';

export const PosterGeneratorPage: React.FC = () => {
  const [homeTeam, setHomeTeam] = useState('Thunder Strikers FC');
  const [awayTeam, setAwayTeam] = useState('Apex Predators');
  const [matchDate, setMatchDate] = useState('Saturday, 28 November 2026');
  const [matchTime, setMatchTime] = useState('20:00 GMT');
  const [venue, setVenue] = useState('Thunder Arena, Manchester');
  const [headline, setHeadline] = useState('CLASH OF THE TITANS');
  const [theme, setTheme] = useState<'neon' | 'dark' | 'gold'>('neon');
  const [featuredPlayer, setFeaturedPlayer] = useState('Mateo Rossi (10)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownload = () => {
    showToast('Matchday Poster generated and downloaded successfully!');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `⚽ MATCHDAY POSTER: ${homeTeam} vs ${awayTeam} | ${matchDate} at ${venue}`
    );
    showToast('Poster share link copied to clipboard!');
  };

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
            <span>Team & Matchday Poster Studio</span>
            <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
              Interactive Designer
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Craft broadcast-quality match promotion graphics, lineup teasers, and franchise announcements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} icon={Copy}>
            Share Details
          </Button>
          <Button variant="primary" size="sm" onClick={handleDownload} icon={Download}>
            Export Graphic
          </Button>
        </div>
      </div>

      {/* Main Studio Workspace: Left Controls, Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (5 cols) */}
        <Card glow className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-pitch-border pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            Poster Configuration
          </h3>

          {/* Theme Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Visual Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'neon', label: 'Neon Pitch' },
                { id: 'dark', label: 'Stadium Dark' },
                { id: 'gold', label: 'Gold Trophy' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    theme === t.id
                      ? 'bg-football-accent text-slate-950 shadow-pitch-glow'
                      : 'bg-pitch-darker text-slate-400 hover:text-white border border-pitch-border'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Slogan */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Match Slogan / Banner</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Teams Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Home Franchise</label>
              <select
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option>Thunder Strikers FC</option>
                <option>Apex Predators</option>
                <option>Metro City United</option>
                <option>Red Dragons SC</option>
                <option>Emerald Warriors</option>
                <option>Coastal Vipers FC</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Away Franchise</label>
              <select
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option>Apex Predators</option>
                <option>Thunder Strikers FC</option>
                <option>Metro City United</option>
                <option>Red Dragons SC</option>
                <option>Emerald Warriors</option>
                <option>Coastal Vipers FC</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Fixture Date</label>
              <input
                type="text"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Kick-off Time</label>
              <input
                type="text"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Stadium Venue */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Stadium Arena</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Featured Headliner */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Spotlight Player</label>
            <input
              type="text"
              value={featuredPlayer}
              onChange={(e) => setFeaturedPlayer(e.target.value)}
              className="w-full bg-pitch-darker border border-pitch-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>
        </Card>

        {/* Right Column: Live Poster Graphic Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div
            className={`w-full max-w-lg aspect-[4/5] rounded-3xl p-8 relative flex flex-col justify-between overflow-hidden shadow-2xl border ${
              theme === 'neon'
                ? 'bg-gradient-to-br from-pitch-darkest via-orange-950 to-slate-950 border-orange-500/50 shadow-pitch-glow-lg'
                : theme === 'gold'
                ? 'bg-gradient-to-br from-slate-950 via-amber-950 to-stone-950 border-amber-500/50 shadow-[0_0_40px_-5px_rgba(234,179,8,0.3)]'
                : 'bg-gradient-to-br from-slate-950 via-pitch-darker to-black border-pitch-border'
            }`}
          >
            {/* Background Texture & Pitch Grid */}
            <div className="absolute inset-0 pitch-pattern opacity-30 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

            {/* Poster Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚽</span>
                <span className="text-xs font-black tracking-widest text-orange-400 uppercase">
                  PREMIER LEAGUE 2026/27
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-white/70 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                MATCHDAY 01
              </span>
            </div>

            {/* Middle Section: Slogan & Matchup */}
            <div className="relative z-10 my-auto text-center space-y-6">
              <span className="inline-block text-[11px] font-black uppercase tracking-[0.25em] text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30">
                {headline}
              </span>

              {/* Head-to-Head Clash */}
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <div className="flex-1 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl sm:text-4xl shadow-lg mb-2">
                    ⚡
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                    {homeTeam}
                  </h4>
                  <span className="text-[10px] font-mono text-orange-400">HOME</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl font-black text-white/40 italic">
                    VS
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mt-1">
                    LIVE
                  </span>
                </div>

                <div className="flex-1 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl sm:text-4xl shadow-lg mb-2">
                    🦅
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                    {awayTeam}
                  </h4>
                  <span className="text-[10px] font-mono text-rose-400">AWAY</span>
                </div>
              </div>

              {/* Spotlight Star Callout */}
              <div className="inline-flex items-center gap-2 p-2 px-4 rounded-xl bg-white/5 border border-white/10 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-slate-300">Spotlight Player:</span>
                <strong className="text-white font-mono">{featuredPlayer}</strong>
              </div>
            </div>

            {/* Poster Footer: Logistics */}
            <div className="relative z-10 border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-400" />
                <span>
                  {matchDate} • {matchTime}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span className="truncate max-w-[180px]">{venue}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
