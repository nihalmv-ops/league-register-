import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fs from 'fs';
import { config } from './config/env';
import apiRoutes from './routes';
import { notFoundHandler } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Application => {
  const app: Application = express();

  // Ensure local uploads directory exists
  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }

  // Security and utility middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows client apps to render uploaded photos
    })
  );

  app.use(
    cors({
      origin: [
        config.clientUrl,
        config.playerRegistrationUrl,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
      ],
      credentials: true,
    })
  );

  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static file serving for uploaded photos
  app.use('/uploads', express.static(config.uploadDir));

  // Root welcome & API health check aliases
  app.get('/', (_req, res) => {
    res.json({
      name: 'Football League & Auction API',
      phase: 'Phase 2 - Public Player Registration & Admin Workflow',
      status: 'online',
      endpoints: {
        health: '/api/health',
        registerPlayer: 'POST /api/players/register',
        checkStatus: 'GET /api/players/status/:identifier',
        adminLogin: 'POST /api/auth/login',
        adminPlayers: 'GET /api/players (JWT required)',
        dashboardOverview: '/api/dashboard/overview',
      },
    });
  });

  // Direct health alias
  app.get('/health', (_req, res) => {
    res.redirect('/api/health');
  });

  // Mount modular API routes
  app.use('/api', apiRoutes);

  // Catch-all 404 & Centralized Error Handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
