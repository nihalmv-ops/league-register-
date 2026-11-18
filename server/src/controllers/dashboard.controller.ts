import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/apiResponse';

export const getDashboardOverview = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const overview = await DashboardService.getOverview();
    sendSuccess(res, overview, 'Dashboard overview retrieved successfully');
  } catch (error) {
    next(error);
  }
};
