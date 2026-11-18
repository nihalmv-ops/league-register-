import mongoose from 'mongoose';
import { config } from './env';
import { logger } from '../utils/logger';

export type DbStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

let currentStatus: DbStatus = 'disconnected';

export const connectDatabase = async (): Promise<boolean> => {
  try {
    currentStatus = 'connecting';
    logger.info(`Attempting MongoDB connection to: ${config.mongodbUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

    mongoose.connection.on('connected', () => {
      currentStatus = 'connected';
      logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      currentStatus = 'error';
      logger.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      currentStatus = 'disconnected';
      logger.warn('MongoDB disconnected');
    });

    // Connection timeout 5s so boot isn't blocked if Mongo isn't running
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });

    currentStatus = 'connected';
    return true;
  } catch (error: any) {
    currentStatus = 'disconnected';
    logger.warn(`MongoDB not accessible: ${error?.message || error}. Running in standalone mode.`);
    logger.info('Tip: Start MongoDB service locally or configure MONGODB_URI in server/.env');
    return false;
  }
};

export const getDbStatus = (): { status: DbStatus; isReady: boolean } => {
  const readyState = mongoose.connection.readyState;
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const mappedStatus: DbStatus =
    readyState === 1 ? 'connected' : readyState === 2 ? 'connecting' : 'disconnected';

  return {
    status: mappedStatus,
    isReady: readyState === 1,
  };
};
