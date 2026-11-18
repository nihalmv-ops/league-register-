import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from './env';
import { logger } from '../utils/logger';

// Configure Cloudinary if credentials are provided
if (config.cloudinary.isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
  logger.info('☁️ Cloudinary configured successfully for media uploads');
} else {
  logger.warn('☁️ Cloudinary credentials not provided in .env; using secure local disk uploads (/uploads/players)');
}

export interface UploadResult {
  url: string;
  publicId?: string;
  storage: 'cloudinary' | 'local';
}

/**
 * Upload player profile photo to Cloudinary with automatic local fallback
 */
export async function uploadPlayerPhoto(
  fileBuffer: Buffer,
  originalFilename: string,
  mimetype: string
): Promise<UploadResult> {
  // If Cloudinary is configured, upload to Cloudinary CDN
  if (config.cloudinary.isConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'football_league/players',
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png'],
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto:good' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            logger.error('Cloudinary upload error:', error);
            reject(new Error(error?.message || 'Failed to upload photo to Cloudinary'));
          } else {
            logger.info(`Photo uploaded to Cloudinary: ${result.secure_url}`);
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              storage: 'cloudinary',
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  // Local uploads fallback
  try {
    const playersDir = path.join(config.uploadDir, 'players');
    if (!fs.existsSync(playersDir)) {
      fs.mkdirSync(playersDir, { recursive: true });
    }

    const ext = path.extname(originalFilename).toLowerCase() || (mimetype === 'image/png' ? '.png' : '.jpg');
    const randomHash = crypto.randomBytes(8).toString('hex');
    const safeFilename = `player_${Date.now()}_${randomHash}${ext}`;
    const destinationPath = path.join(playersDir, safeFilename);

    fs.writeFileSync(destinationPath, fileBuffer);
    const publicUrl = `/uploads/players/${safeFilename}`;

    logger.info(`Photo saved locally to ${destinationPath} -> ${publicUrl}`);
    return {
      url: publicUrl,
      publicId: safeFilename,
      storage: 'local',
    };
  } catch (err: any) {
    logger.error('Failed to write photo locally:', err);
    throw new Error(`Failed to save photo locally: ${err?.message || err}`);
  }
}
