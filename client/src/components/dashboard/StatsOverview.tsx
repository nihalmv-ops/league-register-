import React from 'react';
import {
  Users,
  UserCheck,
  Clock,
  Shield,
  Gavel,
  UserMinus,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { DashboardStats } from '../../types/dashboard';

interface StatsOverviewProps {
  stats: DashboardStats;
  onStatClick?: (statType: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, onStatClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Total Registered Players */}
      <StatCard
        title="Registered"
        value={stats.totalRegisteredPlayers}
        subtitle="Total applicants"
        icon={Users}
        color="blue"
        trend={{
          value: '+18%',
          isPositive: true,
          label: 'vs last week',
        }}
        onClick={() => onStatClick?.('registered')}
      />

      {/* 2. Approved Players */}
      <StatCard
        title="Approved"
        value={stats.approvedPlayers}
        subtitle="Eligible for draft"
        icon={UserCheck}
        color="green"
        trend={{
          value: '75.6%',
          isPositive: true,
          label: 'approval rate',
        }}
        onClick={() => onStatClick?.('approved')}
      />

      {/* 3. Pending Registrations */}
      <StatCard
        title="Pending"
        value={stats.pendingRegistrations}
        subtitle="Awaiting review"
        icon={Clock}
        color="yellow"
        badge="Action Needed"
        onClick={() => onStatClick?.('pending')}
      />

      {/* 4. Total Teams */}
      <StatCard
        title="Total Teams"
        value={stats.totalTeams}
        subtitle="Franchise clubs"
        icon={Shield}
        color="purple"
        trend={{
          value: '8 / 8',
          isPositive: true,
          label: 'slots full',
        }}
        onClick={() => onStatClick?.('teams')}
      />

      {/* 5. Players Sold */}
      <StatCard
        title="Players Sold"
        value={stats.playersSold}
        subtitle="Auction drafted"
        icon={Gavel}
        color="green"
        trend={{
          value: `${Math.round((stats.playersSold / (stats.approvedPlayers || 1)) * 100)}%`,
          isPositive: true,
          label: 'pool drafted',
        }}
        onClick={() => onStatClick?.('sold')}
      />

      {/* 6. Players Remaining for Auction */}
      <StatCard
        title="Remaining"
        value={stats.playersRemaining}
        subtitle="In auction pool"
        icon={UserMinus}
        color="red"
        trend={{
          value: `${stats.playersRemaining} lots`,
          isPositive: false,
          label: 'unassigned',
        }}
        onClick={() => onStatClick?.('remaining')}
      />
    </div>
  );
};
