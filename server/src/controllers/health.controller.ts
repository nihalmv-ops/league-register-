import { Request, Response } from 'express';
import { getDbStatus } from '../config/db';
import { sendSuccess } from '../utils/apiResponse';

export const getHealth = (_req: Request, res: Response): void => {
  const dbInfo = getDbStatus();
  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: 'ok',
    service: 'Football League & Auction API',
    version: '1.0.0 (Phase 1)',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbInfo.status,
      connected: dbInfo.isReady,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        heapUsedMB: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMB: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
      },
    },
  };

  sendSuccess(res, healthData, 'API health check passed');
};
