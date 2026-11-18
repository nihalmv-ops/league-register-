import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/db';
import { logger } from './utils/logger';
import { Admin } from './models/Admin';

// Helper to seed initial admin
const seedInitialAdmin = async () => {
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
  } catch (err: any) {
    logger.warn('Initial admin check deferred:', err?.message || err);
  }
};

// Bootstrap Server
const startServer = async () => {
  try {
    const server = app.listen(config.port, () => {
      logger.info(`⚽ Football League Management Server is running on port ${config.port}`);
      logger.info(`🚀 API Base URL: http://localhost:${config.port}/api`);
      logger.info(`🩺 Health Check: http://localhost:${config.port}/api/health`);
      logger.info(`📝 Player Registration Endpoint: http://localhost:${config.port}/api/players/register`);
    });

    // Connect to database in background
    connectDatabase()
      .then((connected) => {
        if (connected) {
          seedInitialAdmin();
        }
      })
      .catch((err) => {
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
