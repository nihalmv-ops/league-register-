import { Router } from 'express';
import {
  registerPlayer,
  checkRegistrationStatus,
  getAllPlayers,
  getPlayerById,
  approvePlayer,
  rejectPlayer,
  getRegistrationStats,
} from '../controllers/player.controller';
import { uploadPlayerPhotoMiddleware } from '../middleware/upload';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// ================================
// Public Routes
// ================================

// 1. Submit Player Application (Requires exactly 6 fields with photo file)
router.post('/register', uploadPlayerPhotoMiddleware, registerPlayer);

// 2. Check Application Status (by registrationId or email)
router.get('/status/:identifier', checkRegistrationStatus);

// ================================
// Admin Protected Routes
// ================================

// 3. Get all player applications with search & filter
router.get('/', authenticateAdmin, getAllPlayers);

// 4. Get registration statistics
router.get('/stats', authenticateAdmin, getRegistrationStats);

// 5. Get single player application details
router.get('/:id', authenticateAdmin, getPlayerById);

// 6. Approve application (adds to auction pool)
router.patch('/:id/approve', authenticateAdmin, approvePlayer);

// 7. Reject application
router.patch('/:id/reject', authenticateAdmin, rejectPlayer);

export default router;
