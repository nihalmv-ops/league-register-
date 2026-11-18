import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode = 200
): Response => {
  const responsePayload: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(responsePayload);
};

export const sendError = (
  res: Response,
  message = 'An unexpected error occurred',
  statusCode = 500,
  details: unknown = null,
  errorCode?: string
): Response => {
  const responsePayload: ApiResponse = {
    success: false,
    message,
    error: {
      code: errorCode || `HTTP_${statusCode}`,
      details: details || undefined,
    },
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(responsePayload);
};
