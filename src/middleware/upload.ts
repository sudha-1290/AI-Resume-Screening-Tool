import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { CustomError } from './errorHandler';
import { logger } from '../utils/logger';

class UploadMiddleware {
  // Configure storage
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = process.env.UPLOAD_PATH || './uploads';
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      // Create subdirectories for different file types
      const subDir = this.getSubDirectory(file.mimetype);
      const fullPath = path.join(uploadPath, subDir);
      
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });

  // File filter
  fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,docx,doc').split(',');
    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
    
    // Check file extension
    if (!allowedTypes.includes(fileExtension)) {
      const error = new CustomError(
        `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        400
      );
      cb(error);
      return;
    }

    // Check MIME type
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      const error = new CustomError(
        `Invalid file type. Allowed MIME types: ${allowedMimeTypes.join(', ')}`,
        400
      );
      cb(error);
      return;
    }

    // Check file size
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB
    if (file.size > maxSize) {
      const error = new CustomError(
        `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`,
        400
      );
      cb(error);
      return;
    }

    // Log file upload
    logger.info(`File upload: ${file.originalname} (${file.size} bytes)`);
    
    cb(null, true);
  };

  // Get subdirectory based on file type
  private getSubDirectory(mimeType: string): string {
    switch (mimeType) {
      case 'application/pdf':
        return 'pdfs';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'docx';
      case 'application/msword':
        return 'docs';
      default:
        return 'others';
    }
  }

  // Validate uploaded file
  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new CustomError('No file uploaded', 400);
    }

    // Additional validation can be added here
    // For example, checking if file is corrupted, contains malware, etc.
  }

  // Clean up uploaded files
  async cleanupFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Cleaned up file: ${filePath}`);
      }
    } catch (error) {
      logger.error(`Error cleaning up file ${filePath}:`, error);
    }
  }

  // Get file info
  getFileInfo(file: Express.Multer.File) {
    return {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      extension: path.extname(file.originalname).toLowerCase()
    };
  }
}

export const uploadMiddleware = new UploadMiddleware(); 