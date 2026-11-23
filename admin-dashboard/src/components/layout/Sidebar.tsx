import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Shield,
  Gavel,
  Shirt,
  Image as ImageIcon,
  Calendar,
  Award,
  ListOrdered,
  Settings,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  X,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  pendingCount?: number;
}

interface NavItemConfig {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: 'green' | 'yellow' | 'blue' | 'purple' | 'red';
  isLive?: boolean;
  category?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  pendingCount = 28,
}) => {
  const navigationItems: NavItemConfig[] = [
    {
      title: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      category: 'Overview',
    },
    {
      title: 'Players',
      path: '/players',
      icon: Users,
      badge: '148',
      badgeVariant: 'blue',
      category: 'Player Roster',
    },
    {
      title: 'Registrations',
      path: '/registrations',
      icon: ClipboardList,
      badge: pendingCount > 0 ? `${pendingCount} new` : undefined,
      badgeVariant: 'yellow',
      category: 'Player Roster',
    },
    {
      title: 'Teams',
      path: '/teams',
      icon: Shield,
      badge: '8',
      badgeVariant: 'purple',
      category: 'Franchises',
    },
    {
      title: 'Live Auction',
      path: '/auction',
      icon: Gavel,
      isLive: true,
      category: 'Auction Hub',
    },
    {
      title: 'Team Squads',
      path: '/squads',
      icon: Shirt,
      category: 'Auction Hub',
    },
    {
      title: 'Team Poster Generator',
      path: '/poster-generator',
      icon: ImageIcon,
      category: 'Creative Hub',
    },
    {
      title: 'Fixtures',
      path: '/fixtures',
      icon: Calendar,
      category: 'Competition',
    },
    {
      title: 'Match Results',
      path: '/results',
      icon: Award,
      category: 'Competition',
    },
    {
      title: 'Points Table',
      path: '/standings',
      icon: ListOrdered,
      category: 'Competition',
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings,
      category: 'System',
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col bg-pitch-darker border-r border-pitch-border select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-pitch-border bg-pitch-darkest/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-pitch-glow shrink-0">
            <span className="text-xl">⚽</span>
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <span className="text-sm font-extrabold text-white tracking-tight leading-tight truncate">
                PREMIER LEAGUE
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-orange-400 uppercase truncate">
                Auction & Admin Hub
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-pitch-card"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        {navigationItems.map((item, idx) => {
          const Icon = item.icon;
          const showCategoryHeader =
            (!collapsed || mobileOpen) &&
            (idx === 0 || item.category !== navigationItems[idx - 1]?.category);

          return (
            <React.Fragment key={item.path}>
              {showCategoryHeader && item.category && (
                <div className="pt-3 pb-1 px-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.category}
                  </span>
                </div>
              )}

              <NavLink
                to={item.path}
                onClick={onCloseMobile}
                title={collapsed && !mobileOpen ? item.title : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-pitch-glow'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-pitch-card/70 border border-transparent'
                  } ${collapsed && !mobileOpen ? 'justify-center px-2' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active left indicator strip */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-football-accent rounded-r-full" />
                    )}

                    <div
                      className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-football-accent' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {(!collapsed || mobileOpen) && (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="truncate">{item.title}</span>

                        {item.isLive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                            <CircleDot className="w-2.5 h-2.5 text-rose-400" />
                            LIVE
                          </span>
                        )}

                        {item.badge && !item.isLive && (
                          <Badge
                            variant={item.badgeVariant || 'slate'}
                            size="sm"
                            className="text-[10px] py-0 px-1.5"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            </React.Fragment>
          );
        })}
      </div>

      {/* Footer / System Status & Collapse Toggle */}
      <div className="p-3 border-t border-pitch-border bg-pitch-darkest/60 space-y-2">
        {(!collapsed || mobileOpen) && (
          <div className="p-2.5 rounded-xl bg-pitch-card/60 border border-pitch-border/60 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 font-semibold text-[11px]">System Phase</span>
              <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                Phase 1 Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              League Setup & Admin Console
            </p>
          </div>
        )}

        {/* Desktop Collapse Button */}
        <div className="hidden lg:flex items-center justify-end">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-pitch-card border border-pitch-border/40 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-[11px] font-medium">Collapse View</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer Sheet */}
      <aside
        className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
