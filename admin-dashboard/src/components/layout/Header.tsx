import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  RotateCw,
  Database,
  Activity,
  Bell,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  apiConnected: boolean;
  dbStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  isRefreshing?: boolean;
  onRefresh?: () => void;
  lastUpdated?: Date;
}

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard Overview', subtitle: 'Live Football League & Auction Operations' },
  '/players': { title: 'Player Pool & Roster', subtitle: 'Manage Registered Players & Tiers' },
  '/registrations': { title: 'Player Registrations', subtitle: 'Review & Verify Candidate Applications' },
  '/teams': { title: 'Franchise Teams', subtitle: 'Club Profiles, Budgets & Management' },
  '/auction': { title: 'Live Player Auction Arena', subtitle: 'Real-Time Player Bidding Console' },
  '/squads': { title: 'Team Squads & Formations', subtitle: 'Roster Balance & Tactical Lineups' },
  '/poster-generator': { title: 'Team Poster Generator', subtitle: 'Design Matchday & Squad Graphics' },
  '/fixtures': { title: 'League Fixtures & Schedule', subtitle: 'Season Calendar & Match Schedules' },
  '/results': { title: 'Match Results & Reports', subtitle: 'Scores, Scorers & Match Statistics' },
  '/standings': { title: 'League Points Table', subtitle: 'Standings, Goal Difference & Form' },
  '/settings': { title: 'System & League Settings', subtitle: 'API, MongoDB & Auction Configuration' },
};

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  apiConnected,
  dbStatus,
  isRefreshing = false,
  onRefresh,
  lastUpdated,
}) => {
  const location = useLocation();
  const currentRoute = routeTitles[location.pathname] || {
    title: 'Management Console',
    subtitle: 'Football League Operations',
  };

  const getDbBadge = () => {
    switch (dbStatus) {
      case 'connected':
        return (
          <Badge variant="green" size="sm" dot>
            <Database className="w-3 h-3" />
            MongoDB Ready
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="yellow" size="sm" dot>
            <Database className="w-3 h-3" />
            Connecting DB...
          </Badge>
        );
      default:
        return (
          <Badge variant="yellow" size="sm" dot>
            <Database className="w-3 h-3" />
            Standalone Mode
          </Badge>
        );
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-pitch-darkest/90 backdrop-blur-md border-b border-pitch-border px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile trigger & Current Section Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-pitch-card focus:outline-none"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight truncate">
              {currentRoute.title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              2026-27 Season
            </span>
          </div>
          <p className="hidden md:block text-xs text-slate-400 truncate">
            {currentRoute.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Live Status, Refresh, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Backend API Health Status */}
        <div className="hidden sm:flex items-center gap-2">
          {apiConnected ? (
            <Badge variant="green" size="sm" dot>
              <Activity className="w-3 h-3" />
              API Online
            </Badge>
          ) : (
            <Badge variant="red" size="sm" dot>
              <AlertTriangle className="w-3 h-3" />
              API Offline
            </Badge>
          )}

          {/* Database status */}
          {getDbBadge()}
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-pitch-card border border-pitch-border/50 transition-all ${
              isRefreshing ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            title={
              lastUpdated
                ? `Last updated: ${lastUpdated.toLocaleTimeString()}. Click to refresh.`
                : 'Refresh metrics'
            }
          >
            <RotateCw
              className={`w-4 h-4 text-emerald-400 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
          </button>
        )}

        {/* Notification indicator */}
        <div className="relative">
          <button
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-pitch-card border border-pitch-border/50 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-pitch-darkest" />
          </button>
        </div>

        {/* Admin Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-pitch-border/60">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-pitch-border flex items-center justify-center font-bold text-xs text-emerald-400">
            AD
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-200 leading-tight">
              League Admin
            </span>
            <span className="text-[10px] text-emerald-400 leading-tight">
              Head Commissioner
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
