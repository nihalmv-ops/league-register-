import { Request, Response } from 'express';
import { z } from 'zod';
import { PlayingPosition } from '../models/Player';
import { uploadPlayerPhoto } from '../config/cloudinary';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { playerRepository } from '../services/playerRepository';

// Position validator
const validPositions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const;

// Schema for registration text fields
const playerRegistrationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Full name contains invalid characters'),
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
    .refine((val) => {
      const birth = new Date(val);
      const now = new Date();
      const age = (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= 12 && age <= 60;
    }, 'Player must be between 12 and 60 years of age'),
  phoneNumber: z
    .string()
    .min(7, 'Phone number must be at least 7 digits')
    .max(25, 'Phone number must not exceed 25 characters')
    .refine((val) => /^[\d\s()+.-]+$/.test(val), 'Phone number contains invalid characters')
    .refine((val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length >= 7 && digits.length <= 15;
    }, 'Phone number must contain between 7 and 15 digits'),
  email: z
    .string()
    .email('Invalid email address')
    .max(120, 'Email must not exceed 120 characters'),
  playingPosition: z.enum(validPositions, {
    errorMap: () => ({ message: 'Playing position must be Goalkeeper, Defender, Midfielder, or Forward' }),
  }),
});

/**
 * Helper to generate unique registration ID
 */
async function generateUniqueRegistrationId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  let uniqueId = '';
  let exists = true;

  while (exists) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 digits
    uniqueId = `PLR-${currentYear}-${randomDigits}`;
    const taken = await playerRepository.isRegistrationIdTaken(uniqueId);
    if (!taken) {
      exists = false;
    }
  }

  return uniqueId;
}

/**
 * Public Player Registration
 * Required 6 fields: fullName, dateOfBirth, phoneNumber, email, playingPosition, photo (file)
 */
export const registerPlayer = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Verify photo file is uploaded
    if (!req.file) {
      sendError(res, 'Player profile photo is required', 400, null, 'PHOTO_REQUIRED');
      return;
    }

    // 2. Validate textual fields with Zod
    const validation = playerRegistrationSchema.safeParse(req.body);
    if (!validation.success) {
      const errorMap = validation.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      sendError(res, 'Validation failed for registration fields', 400, errorMap, 'VALIDATION_ERROR');
      return;
    }

    const { fullName, dateOfBirth, phoneNumber, email, playingPosition } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phoneNumber.replace(/[\s-]/g, '').trim();

    // 3. Prevent duplicate registrations (Check email & phone)
    const existingPlayer = await playerRepository.findByEmailOrPhone(normalizedEmail, normalizedPhone);

    if (existingPlayer) {
      if (existingPlayer.email.toLowerCase().trim() === normalizedEmail) {
        sendError(
          res,
          `A registration with the email "${normalizedEmail}" already exists. Check your application status using your Registration ID.`,
          409,
          { field: 'email', registrationId: existingPlayer.registrationId },
          'DUPLICATE_EMAIL'
        );
        return;
      } else {
        sendError(
          res,
          `A registration with the phone number "${phoneNumber}" already exists.`,
          409,
          { field: 'phoneNumber', registrationId: existingPlayer.registrationId },
          'DUPLICATE_PHONE'
        );
        return;
      }
    }

    // 4. Securely upload photo to Cloudinary (or local fallback)
    const uploadResult = await uploadPlayerPhoto(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // 5. Generate unique Registration ID
    const registrationId = await generateUniqueRegistrationId();

    // 6. Save player with status PENDING
    const newPlayer = await playerRepository.create({
      registrationId,
      fullName: fullName.trim(),
      dateOfBirth: new Date(dateOfBirth),
      phoneNumber: normalizedPhone,
      email: normalizedEmail,
      playingPosition: playingPosition as PlayingPosition,
      photoUrl: uploadResult.url,
      photoPublicId: uploadResult.publicId,
      status: 'PENDING',
      auctionStatus: 'upcoming',
      basePrice: 50000,
      overallRating: 75,
      tier: 'Silver',
    });

    logger.info(`⚽ New Player Registered: ${newPlayer.fullName} (${newPlayer.registrationId}) - ${newPlayer.playingPosition}`);

    // 7. Return registration confirmation (omitting internal fields)
    sendSuccess(
      res,
      {
        registrationId: newPlayer.registrationId,
        fullName: newPlayer.fullName,
        email: newPlayer.email,
        playingPosition: newPlayer.playingPosition,
        photoUrl: newPlayer.photoUrl,
        status: newPlayer.status,
        createdAt: newPlayer.createdAt,
      },
      'Player registration submitted successfully! Your application is now PENDING review.',
      201
    );
  } catch (error: any) {
    logger.error('Registration processing failed:', error);
    sendError(res, error.message || 'Registration processing error', 500);
  }
};

/**
 * Public: Check application status by Registration ID or Email
 * Exposes only safe status info without leaking private player data
 */
export const checkRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.identifier;
    const identifier = String(rawId || '').trim();

    if (!identifier) {
      sendError(res, 'Registration ID or Email is required', 400);
      return;
    }

    const player = await playerRepository.findByIdentifier(identifier);

    if (!player) {
      sendError(res, 'No player registration found matching this ID or Email', 404, null, 'NOT_FOUND');
      return;
    }

    // Mask name for public privacy (e.g. "John D***")
    const names = player.fullName.split(' ');
    const maskedName =
      names.length > 1
        ? `${names[0]} ${names[1].charAt(0)}***`
        : `${player.fullName.slice(0, 3)}***`;

    sendSuccess(
      res,
      {
        registrationId: player.registrationId,
        displayName: maskedName,
        playingPosition: player.playingPosition,
        photoUrl: player.photoUrl,
        status: player.status,
        rejectionReason: player.status === 'REJECTED' ? player.rejectionReason : null,
        submittedAt: player.createdAt,
        reviewedAt: player.reviewedAt,
      },
      'Registration status retrieved'
    );
  } catch (error: any) {
    logger.error('Status check error:', error);
    sendError(res, 'Failed to retrieve application status', 500);
  }
};

/**
 * Admin: Get all player applications with search & filters
 */
export const getAllPlayers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      status,
      position,
      search,
      page = '1',
      limit = '50',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit), 10)));

    const result = await playerRepository.findAll({
      status: status ? String(status) : undefined,
      position: position ? String(position) : undefined,
      search: search ? String(search) : undefined,
      page: pageNum,
      limit: limitNum,
      sortBy: String(sortBy),
      order: String(order),
    });

    sendSuccess(
      res,
      {
        players: result.players,
        pagination: {
          total: result.total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(result.total / limitNum) || 1,
        },
        stats: result.stats,
      },
      'Players retrieved successfully'
    );
  } catch (error: any) {
    logger.error('Error fetching players:', error);
    sendError(res, error.message || 'Failed to fetch players', 500);
  }
};

/**
 * Admin: Get single player details
 */
export const getPlayerById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const player = await playerRepository.findById(id);

    if (!player) {
      sendError(res, 'Player application not found', 404);
      return;
    }

    sendSuccess(res, player, 'Player application retrieved');
  } catch (error: any) {
    sendError(res, 'Error fetching player details', 500);
  }
};

/**
 * Admin: Approve player application
 * Only APPROVED players can participate in the auction!
 */
export const approvePlayer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const adminName = req.admin?.name || 'Administrator';

    const player = await playerRepository.updateStatus(id, {
      status: 'APPROVED',
      reviewedBy: adminName,
    });

    if (!player) {
      sendError(res, 'Player not found', 404);
      return;
    }

    logger.info(`✅ Player APPROVED by ${adminName}: ${player.fullName} (${player.registrationId})`);

    sendSuccess(
      res,
      player,
      `Player application for "${player.fullName}" has been APPROVED and added to the Auction Pool.`
    );
  } catch (error: any) {
    logger.error('Error approving player:', error);
    sendError(res, 'Failed to approve player application', 500);
  }
};

/**
 * Admin: Reject player application
 */
export const rejectPlayer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    const { reason } = req.body;
    const adminName = req.admin?.name || 'Administrator';

    const player = await playerRepository.updateStatus(id, {
      status: 'REJECTED',
      reviewedBy: adminName,
      rejectionReason: reason || 'Application did not satisfy league criteria',
    });

    if (!player) {
      sendError(res, 'Player not found', 404);
      return;
    }

    logger.info(`❌ Player REJECTED by ${adminName}: ${player.fullName} (${player.registrationId}) - Reason: ${player.rejectionReason}`);

    sendSuccess(
      res,
      player,
      `Player application for "${player.fullName}" has been REJECTED.`
    );
  } catch (error: any) {
    logger.error('Error rejecting player:', error);
    sendError(res, 'Failed to reject player application', 500);
  }
};

/**
 * Admin: Get registration metrics and breakdown
 */
export const getRegistrationStats = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const stats = await playerRepository.getStats();
    sendSuccess(res, stats, 'Registration statistics retrieved');
  } catch (error: any) {
    sendError(res, 'Failed to calculate stats', 500);
  }
};
