import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { sendError } from '../utils/apiResponse';

export interface AdminPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminPayload;
}

export const authenticateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authorization token required. Access denied.', 401, null, 'UNAUTHORIZED');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AdminPayload;
    req.admin = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendError(res, 'Session token expired. Please log in again.', 401, null, 'TOKEN_EXPIRED');
      return;
    }
    sendError(res, 'Invalid authorization token. Access denied.', 401, null, 'INVALID_TOKEN');
  }
};
