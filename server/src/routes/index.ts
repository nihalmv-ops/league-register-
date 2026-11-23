import { Router } from 'express';
import healthRoutes from './health.routes';
import dashboardRoutes from './dashboard.routes';
import authRoutes from './auth.routes';
import playerRoutes from './player.routes';
import auctionRoutes from './auction.routes';

const router = Router();

// Modular endpoints
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/players', playerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', auctionRoutes);

export default router;
