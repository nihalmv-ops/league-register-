import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useHealthCheck } from '../../hooks/useHealthCheck';

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Live health monitoring
  const { health, loading: healthLoading, refresh: refreshHealth } = useHealthCheck(30000);

  const apiConnected = !healthLoading && health?.status === 'ok';
  const dbStatus = health?.database?.status || 'disconnected';

  return (
    <div className="min-h-screen bg-pitch-darkest text-slate-100 flex flex-col pitch-pattern selection:bg-emerald-500 selection:text-black">
      {/* Sidebar (Desktop and Mobile) */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        pendingCount={28}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Header */}
        <Header
          onOpenMobileSidebar={() => setMobileOpen(true)}
          apiConnected={apiConnected}
          dbStatus={dbStatus}
          onRefresh={refreshHealth}
          isRefreshing={healthLoading}
          lastUpdated={health ? new Date(health.timestamp) : undefined}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Subdued Footer */}
        <footer className="border-t border-pitch-border/50 py-4 px-6 text-center text-xs text-slate-400 bg-pitch-darkest/80">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              ⚽ Football League Management & Live Auction System • Phase 1
            </span>
            <div className="flex items-center gap-3 text-slate-400">
              <span>MERN Stack + TypeScript</span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">v1.0.0-phase1</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
