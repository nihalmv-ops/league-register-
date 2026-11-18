import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useHealthCheck } from '../hooks/useHealthCheck';
import { DemoBanner } from '../components/dashboard/DemoBanner';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { PositionDistributionChart } from '../components/dashboard/PositionDistributionChart';
import { RegistrationTrendsChart } from '../components/dashboard/RegistrationTrendsChart';
import { TeamBudgetTable } from '../components/dashboard/TeamBudgetTable';
import { RecentActivityFeed } from '../components/dashboard/RecentActivityFeed';
import { SystemHealthWidget } from '../components/dashboard/SystemHealthWidget';
import {
  StatCardSkeleton,
  ChartSkeleton,
} from '../components/common/LoadingSkeleton';
import { Button } from '../components/common/Button';
import { AlertTriangle, RotateCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, refresh } = useDashboardData();
  const { health, refresh: refreshHealth } = useHealthCheck();

  const handleStatNavigation = (statType: string) => {
    switch (statType) {
      case 'registered':
      case 'approved':
      case 'sold':
      case 'remaining':
        navigate('/players');
        break;
      case 'pending':
        navigate('/registrations');
        break;
      case 'teams':
        navigate('/teams');
        break;
      default:
        break;
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-center max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Unable to load dashboard data</h3>
        <p className="text-sm text-slate-300 mb-6">{error}</p>
        <Button variant="primary" onClick={refresh} icon={RotateCw}>
          Retry Connection
        </Button>
      </div>
    );
  }

  const stats = data?.stats || {
    totalRegisteredPlayers: 148,
    approvedPlayers: 112,
    pendingRegistrations: 28,
    totalTeams: 8,
    playersSold: 46,
    playersRemaining: 66,
  };

  const isDemo = data?.isDemoData ?? true;
  const dbStatus = health?.database?.status || data?.systemStatus?.database || 'disconnected';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Demo Data & DB Status Banner */}
      <DemoBanner isDemoData={isDemo} dbStatus={dbStatus} />

      {/* Top Welcome / Auction Callout Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-pitch-card via-pitch-cardHover to-slate-900 border border-pitch-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Season 2026-27 Management Command Center
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Premier League Auction & Roster Headquarters
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Manage registrations, orchestrate franchise rosters, monitor financial caps,
            and review tournament schedules with live database telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/registrations')}
          >
            Review 28 Pending
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/auction')}
            icon={ArrowRight}
            iconPosition="right"
          >
            Auction Arena
          </Button>
        </div>
      </div>

      {/* 1. Statistics Cards Overview */}
      <section aria-label="Dashboard Overview Statistics">
        <StatsOverview stats={stats} onStatClick={handleStatNavigation} />
      </section>

      {/* 2. Visual Analytics Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PositionDistributionChart
          data={data?.charts?.positionDistribution || [
            { label: 'Midfielders (MID)', value: 48, color: '#10b981' },
            { label: 'Defenders (DEF)', value: 38, color: '#3b82f6' },
            { label: 'Forwards (FWD)', value: 36, color: '#ef4444' },
            { label: 'Goalkeepers (GK)', value: 26, color: '#f59e0b' },
          ]}
        />

        <RegistrationTrendsChart
          data={data?.charts?.registrationTrends || [
            { label: 'Day 1-5', value: 18 },
            { label: 'Day 6-10', value: 35 },
            { label: 'Day 11-15', value: 62 },
            { label: 'Day 16-20', value: 95 },
            { label: 'Day 21-25', value: 124 },
            { label: 'Day 26-30', value: 148 },
          ]}
        />
      </section>

      {/* 3. Team Purse Utilization Table */}
      <section>
        <TeamBudgetTable
          teams={data?.charts?.teamBudgetUtilization || [
            {
              teamName: 'Thunder Strikers FC',
              totalBudget: 1500000,
              spentBudget: 940000,
              playersCount: 7,
              remainingBudget: 560000,
            },
            {
              teamName: 'Apex Predators',
              totalBudget: 1500000,
              spentBudget: 810000,
              playersCount: 6,
              remainingBudget: 690000,
            },
            {
              teamName: 'Metro City United',
              totalBudget: 1500000,
              spentBudget: 1120000,
              playersCount: 8,
              remainingBudget: 380000,
            },
            {
              teamName: 'Red Dragons SC',
              totalBudget: 1500000,
              spentBudget: 750000,
              playersCount: 5,
              remainingBudget: 750000,
            },
            {
              teamName: 'Emerald Warriors',
              totalBudget: 1500000,
              spentBudget: 620000,
              playersCount: 5,
              remainingBudget: 880000,
            },
            {
              teamName: 'Coastal Vipers FC',
              totalBudget: 1500000,
              spentBudget: 490000,
              playersCount: 4,
              remainingBudget: 1010000,
            },
          ]}
        />
      </section>

      {/* 4. Bottom Grid: Recent Activity & System Health Widget */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivityFeed
            activities={data?.recentActivity || [
              {
                id: 'act-1',
                type: 'registration',
                title: 'New Player Registration Received',
                description: 'Liam Sterling (Forward, Age 22) submitted profile for verification',
                timestamp: '10 minutes ago',
                status: 'info',
              },
              {
                id: 'act-2',
                type: 'approval',
                title: 'Player Approved for Auction Pool',
                description: 'Marcus Vance (Midfielder) approved by Head Admin into Silver tier',
                timestamp: '35 minutes ago',
                status: 'success',
              },
              {
                id: 'act-3',
                type: 'auction',
                title: 'Live Auction Practice Session Held',
                description: 'Simulated 5 player lots testing real-time socket broadcasting',
                timestamp: '2 hours ago',
                status: 'warning',
              },
              {
                id: 'act-4',
                type: 'team',
                title: 'Squad Budget Cap Updated',
                description: 'Thunder Strikers FC finalized squad registration roster',
                timestamp: '4 hours ago',
                status: 'info',
              },
              {
                id: 'act-5',
                type: 'fixture',
                title: 'Pre-Season Exhibition Scheduled',
                description: 'Apex Predators vs Metro City United set for Matchday 1 at National Arena',
                timestamp: '6 hours ago',
                status: 'info',
              },
            ]}
          />
        </div>

        <div className="lg:col-span-1">
          <SystemHealthWidget
            initialHealth={health}
            onRefresh={() => {
              refresh();
              refreshHealth();
            }}
          />
        </div>
      </section>
    </div>
  );
};
