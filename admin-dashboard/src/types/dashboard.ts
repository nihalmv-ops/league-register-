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

export interface TeamBudgetItem {
  teamName: string;
  totalBudget: number;
  spentBudget: number;
  playersCount: number;
  remainingBudget: number;
}

export interface DashboardCharts {
  positionDistribution: ChartDataPoint[];
  registrationTrends: ChartDataPoint[];
  teamBudgetUtilization: TeamBudgetItem[];
}

export interface DashboardOverview {
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

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
  error?: {
    code?: string;
    details?: unknown;
  };
}

export interface HealthStatus {
  status: 'ok' | 'error';
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    status: 'connected' | 'disconnected' | 'connecting' | 'error';
    connected: boolean;
  };
  system?: {
    nodeVersion: string;
    platform: string;
    memory: {
      heapUsedMB: number;
      heapTotalMB: number;
    };
  };
}
