import { useState, useEffect, useCallback } from 'react';
import { healthService } from '../services/healthService';
import { HealthStatus } from '../types/dashboard';

export function useHealthCheck(pollIntervalMs = 30000) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    try {
      setLoading(true);
      const data = await healthService.checkHealth();
      setHealth(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to reach API server');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
    if (pollIntervalMs > 0) {
      const interval = setInterval(check, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [check, pollIntervalMs]);

  return { health, loading, error, refresh: check };
}
