import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { HealthStatus } from '../../types/dashboard';
import { healthService } from '../../services/healthService';
import {
  Server,
  Database,
  Cpu,
  Clock,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

interface SystemHealthWidgetProps {
  initialHealth: HealthStatus | null;
  onRefresh?: () => void;
}

export const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({
  initialHealth,
  onRefresh,
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<HealthStatus | null>(initialHealth);
  const [testError, setTestError] = useState<string | null>(null);

  const handleTestPing = async () => {
    try {
      setTesting(true);
      setTestError(null);
      const res = await healthService.checkHealth();
      setTestResult(res);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setTestError(err?.message || 'Failed to ping health check');
    } finally {
      setTesting(false);
    }
  };

  const health = testResult || initialHealth;
  const isHealthy = health?.status === 'ok';
  const isDbConnected = health?.database?.status === 'connected';

  return (
    <Card glow className="bg-gradient-to-br from-pitch-card to-pitch-darker">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isHealthy
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">System & API Diagnostics</h4>
              <Badge variant={isHealthy ? 'green' : 'red'} size="sm" dot>
                {isHealthy ? 'Operational' : 'Offline'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Express + TypeScript API & MongoDB Telemetry
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleTestPing}
          isLoading={testing}
          icon={RotateCw}
        >
          Ping /api/health
        </Button>
      </div>

      {testError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{testError}</span>
        </div>
      )}

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Backend API */}
        <div className="p-3 rounded-xl bg-pitch-darker border border-pitch-border/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Backend Server</span>
            <Server className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-bold text-white text-sm">
            {isHealthy ? 'Port 5000' : 'Disconnected'}
          </div>
          <div className="text-[10px] text-orange-400 mt-0.5">
            {health?.version || 'Phase 1 Build'}
          </div>
        </div>

        {/* MongoDB Connection */}
        <div className="p-3 rounded-xl bg-pitch-darker border border-pitch-border/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">MongoDB Database</span>
            <Database className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-bold text-white text-sm capitalize">
            {health?.database?.status || 'Standalone'}
          </div>
          <div
            className={`text-[10px] mt-0.5 ${
              isDbConnected ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {isDbConnected ? 'Active Connection' : 'Mock/Fallback Mode'}
          </div>
        </div>

        {/* Uptime */}
        <div className="p-3 rounded-xl bg-pitch-darker border border-pitch-border/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Server Uptime</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-bold text-white text-sm font-mono">
            {health?.uptimeSeconds ? `${health.uptimeSeconds}s` : '0s'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Auto-restarting tsx
          </div>
        </div>

        {/* Memory */}
        <div className="p-3 rounded-xl bg-pitch-darker border border-pitch-border/60">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Heap Memory</span>
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-bold text-white text-sm font-mono">
            {health?.system?.memory?.heapUsedMB
              ? `${health.system.memory.heapUsedMB} MB`
              : 'N/A'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Node {health?.system?.nodeVersion || process.version}
          </div>
        </div>
      </div>
    </Card>
  );
};
