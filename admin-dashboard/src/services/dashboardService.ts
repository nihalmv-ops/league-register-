import { request } from './api';
import { DashboardOverview } from '../types/dashboard';

export const dashboardService = {
  getOverview: async (): Promise<DashboardOverview> => {
    const res = await request<DashboardOverview>('/dashboard/overview');
    return res.data;
  },
};
