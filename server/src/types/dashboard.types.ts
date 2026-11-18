export interface DashboardStats {
  totalRegisteredPlayers: number;
  approvedPlayers: number;
  pendingRegistrations: number;
  totalTeams: number;
  playersSold: number;
  playersRemaining: number;
}

export interface ActivityItem {
  id: string;
  type: 'registration' | 'approval' | 'team' | 'auction' | 'fixture';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'info' | 'pending';
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
}

export interface DashboardCharts {
  positionDistribution: ChartDataPoint[];
  registrationTrends: ChartDataPoint[];
  teamBudgetUtilization: {
    teamName: string;
    totalBudget: number;
    spentBudget: number;
    playersCount: number;
    remainingBudget: number;
  }[];
}

export interface DashboardOverviewResponse {
  isDemoData: boolean;
  systemStatus: {
    database: 'connected' | 'disconnected' | 'connecting' | 'error';
    uptimeSeconds: number;
    environment: string;
  };
  stats: DashboardStats;
  charts: DashboardCharts;
  recentActivity: ActivityItem[];
}
