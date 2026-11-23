import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { sendError } from '../utils/apiResponse';

export interface AdminPayload {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'scout';
  name: string;
}

export interface ManagerPayload {
  id: string;
  email: string;
  role: 'manager';
  name: string;
  teamId: string;
  teamName: string;
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminPayload;
  manager?: ManagerPayload;
}

export const authenticateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Administrator authorization token required. Access denied.', 401, null, 'UNAUTHORIZED');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    if (decoded.role === 'manager') {
      sendError(res, 'Forbidden: Team manager credentials cannot access administrator endpoints.', 403, null, 'FORBIDDEN');
      return;
    }
    req.admin = decoded as AdminPayload;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendError(res, 'Session token expired. Please log in again.', 401, null, 'TOKEN_EXPIRED');
      return;
    }
    sendError(res, 'Invalid authorization token. Access denied.', 401, null, 'INVALID_TOKEN');
  }
};

export const authenticateManager = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Team Manager authorization token required. Access denied.', 401, null, 'UNAUTHORIZED');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    if (decoded.role !== 'manager') {
      sendError(res, 'Forbidden: Only authenticated team managers can access manager bidding endpoints.', 403, null, 'FORBIDDEN');
      return;
    }
    req.manager = decoded as ManagerPayload;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendError(res, 'Session token expired. Please log in again.', 401, null, 'TOKEN_EXPIRED');
      return;
    }
    sendError(res, 'Invalid manager authorization token. Access denied.', 401, null, 'INVALID_TOKEN');
  }
};
