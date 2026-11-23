import { Router } from 'express';
import { PosterController } from '../controllers/poster.controller';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// ================= ADMIN TEAM POSTER STUDIO ROUTES =================
// 1. Get all teams for studio selector
router.get('/teams', authenticateAdmin, PosterController.getTeams);

// 2. Get full team squad poster data
router.get('/teams/:teamId/poster-data', authenticateAdmin, PosterController.getTeamPosterData);

// 3. Get individual player cards dataset
router.get('/teams/:teamId/player-cards', authenticateAdmin, PosterController.getTeamPlayerCards);

// 4. Log poster export activity
router.post('/teams/:teamId/poster-export', authenticateAdmin, PosterController.logPosterExport);

export default router;
