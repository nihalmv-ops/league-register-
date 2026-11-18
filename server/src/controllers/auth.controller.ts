import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { adminRepository } from '../services/adminRepository';
import { config } from '../config/env';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      sendError(res, 'Validation error', 400, parseResult.error.errors, 'VALIDATION_ERROR');
      return;
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Find admin via repository (MongoDB with memory fallback)
    const admin = await adminRepository.findByEmail(normalizedEmail);

    if (!admin) {
      sendError(res, 'Invalid email or password', 401, null, 'INVALID_CREDENTIALS');
      return;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401, null, 'INVALID_CREDENTIALS');
      return;
    }

    // Generate JWT Token
    const payload = {
      id: String(admin._id || (admin as any).id),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: '7d',
    });

    sendSuccess(
      res,
      {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
      'Admin logged in successfully'
    );
  } catch (error: any) {
    logger.error('Login error:', error);
    sendError(res, error.message || 'Internal login error', 500);
  }
};

export const getMe = (req: AuthenticatedRequest, res: Response): void => {
  if (!req.admin) {
    sendError(res, 'Not authenticated', 401, null, 'UNAUTHORIZED');
    return;
  }
  sendSuccess(res, { admin: req.admin }, 'Admin profile retrieved');
};
