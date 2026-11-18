import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { connectDatabase } from './config/db';
import { logger } from './utils/logger';
import apiRoutes from './routes';
import { notFoundHandler } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root welcome & API health check aliases
app.get('/', (_req, res) => {
  res.json({
    name: 'Football League & Auction API',
    phase: 'Phase 1 - Project Setup',
    status: 'online',
    endpoints: {
      health: '/api/health',
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

// Bootstrap Server
const startServer = async () => {
  try {
    const server = app.listen(config.port, () => {
      logger.info(`⚽ Football League Management Server is running on port ${config.port}`);
      logger.info(`🚀 API Base URL: http://localhost:${config.port}/api`);
      logger.info(`🩺 Health Check: http://localhost:${config.port}/api/health`);
      logger.info(`📊 Dashboard Stats: http://localhost:${config.port}/api/dashboard/overview`);
    });

    // Connect to database (with standalone fallback)
    connectDatabase().catch((err) => {
      logger.warn('MongoDB connection attempt caught:', err);
    });

    const shutdown = () => {
      logger.info('Shutting down server gracefully...');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
