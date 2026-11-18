import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, and PNG images are permitted.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter,
}).single('photo');

export const uploadPlayerPhotoMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        sendError(res, 'Profile photo exceeds maximum allowed size of 5MB', 400, null, 'FILE_TOO_LARGE');
        return;
      }
      sendError(res, `Upload error: ${err.message}`, 400, null, 'UPLOAD_ERROR');
      return;
    } else if (err) {
      sendError(res, err.message || 'File upload error', 400, null, 'INVALID_FILE');
      return;
    }
    next();
  });
};
