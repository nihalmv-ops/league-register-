import http from 'http';
import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/db';
import { logger } from './utils/logger';
import { Admin } from './models/Admin';
import { setupSocketServer } from './socket';
import { auctionRepository } from './services/auctionRepository';

// Helper to seed initial admin and auction entities
const seedInitialData = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        name: config.adminName,
        email: config.adminEmail.toLowerCase(),
        password: config.adminPassword,
        role: 'superadmin',
      });
      logger.info(`👑 Default admin initialized: ${config.adminEmail}`);
    }

    // Seed Teams, Managers, Auction
    await auctionRepository.ensureSeeded();
  } catch (err: any) {
    logger.warn('Initial seed check deferred:', err?.message || err);
  }
};

// Bootstrap Server
const startServer = async () => {
  try {
    const httpServer = http.createServer(app);

    // Initialize Socket.IO
    const io = setupSocketServer(httpServer);
    logger.info('⚡ Socket.IO real-time engine initialized for Live Player Auction');

    httpServer.listen(config.port, () => {
      logger.info(`⚽ Football League Management Server is running on port ${config.port}`);
      logger.info(`🚀 API Base URL: http://localhost:${config.port}/api`);
      logger.info(`🩺 Health Check: http://localhost:${config.port}/api/health`);
      logger.info(`📝 Player Registration: http://localhost:${config.port}/api/players/register`);
      logger.info(`🔨 Live Auction WebSocket: ws://localhost:${config.port}`);
    });

    // Connect to database in background
    connectDatabase()
      .then((connected) => {
        if (connected) {
          seedInitialData();
        }
      })
      .catch((err) => {
        logger.warn('MongoDB connection attempt caught:', err);
      });

    const shutdown = () => {
      logger.info('Shutting down server gracefully...');
      io.close(() => {
        logger.info('Socket.IO connections closed');
      });
      httpServer.close(() => {
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
