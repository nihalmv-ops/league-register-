import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/football_league',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  playerRegistrationUrl: process.env.PLAYER_REGISTRATION_URL || 'http://localhost:5174',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Authentication
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key_football_league_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Admin Initial Credentials
  adminEmail: process.env.ADMIN_EMAIL || 'admin@football.league',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123456',
  adminName: process.env.ADMIN_NAME || 'League Commissioner',

  // Cloudinary Storage
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    isConfigured: Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ),
  },

  // Local uploads fallback
  uploadDir: path.resolve(__dirname, '../../uploads'),
};
