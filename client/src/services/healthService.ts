import { request } from './api';
import { HealthStatus } from '../types/dashboard';

export const healthService = {
  checkHealth: async (): Promise<HealthStatus> => {
    const res = await request<HealthStatus>('/health');
    return res.data;
  },
};
