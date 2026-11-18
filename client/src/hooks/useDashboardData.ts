import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';
import { DashboardOverview } from '../types/dashboard';

export function useDashboardData() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const overview = await dashboardService.getOverview();
      setData(overview);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err?.message || 'Could not load dashboard metrics from backend API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh: fetchOverview,
  };
}
