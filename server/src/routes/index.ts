import { Router } from 'express';
import healthRoutes from './health.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// Mount routes
router.use('/', healthRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
