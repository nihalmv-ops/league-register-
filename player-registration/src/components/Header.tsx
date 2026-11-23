import React from 'react';
import { Radio, Search, UserPlus } from 'lucide-react';

interface HeaderProps {
  onRegisterClick: () => void;
  onStatusClick: () => void;
  activeTab: 'register' | 'status';
}

export const Header: React.FC<HeaderProps> = ({
  onRegisterClick,
  onStatusClick,
  activeTab,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-pitch-darkest/90 backdrop-blur-md border-b border-pitch-border px-4 sm:px-8 flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-pitch-glow text-xl shrink-0">
          ⚽
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-black text-white tracking-tight">
              PREMIER FOOTBALL LEAGUE
            </span>
          </div>
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block">
            Official Player Registration Portal
          </span>
        </div>
      </div>

      {/* Status Pill & Navigation Actions */}
      <div className="flex items-center gap-3">
        {/* Registration open/closed status */}
        <div className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30">
          <Radio className="w-3 h-3 text-orange-400 animate-pulse" />
          <span>REGISTRATIONS OPEN</span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-pitch-darker p-1 rounded-xl border border-pitch-border text-xs">
          <button
            onClick={onRegisterClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-football-accent text-slate-950 shadow-pitch-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
          <button
            onClick={onStatusClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'status'
                ? 'bg-football-accent text-slate-950 shadow-pitch-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Check Status</span>
          </button>
        </div>
      </div>
    </header>
  );
};
