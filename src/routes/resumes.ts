import { Router } from 'express';
import multer from 'multer';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { resumeController } from '../controllers/resumeController';
import { authMiddleware, authorize } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: uploadMiddleware.storage,
  fileFilter: uploadMiddleware.fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    files: 1
  }
});

// Validation rules
const uploadResumeValidation = [
  body('candidateId')
    .isUUID()
    .withMessage('Valid candidate ID is required'),
  body('jobId')
    .optional()
    .isUUID()
    .withMessage('Valid job ID is required if provided')
];

const updateResumeValidation = [
  body('status')
    .optional()
    .isIn(['uploaded', 'processing', 'processed', 'failed'])
    .withMessage('Invalid status value'),
  body('parsedData')
    .optional()
    .isObject()
    .withMessage('Parsed data must be an object')
];

const getResumesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['uploaded', 'processing', 'processed', 'failed'])
    .withMessage('Invalid status value'),
  query('candidateId')
    .optional()
    .isUUID()
    .withMessage('Valid candidate ID is required if provided'),
  query('jobId')
    .optional()
    .isUUID()
    .withMessage('Valid job ID is required if provided')
];

// Routes
router.post(
  '/upload',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  upload.single('resume'),
  uploadResumeValidation,
  validateRequest,
  resumeController.uploadResume
);

router.get(
  '/',
  authMiddleware,
  getResumesValidation,
  validateRequest,
  resumeController.getResumes
);

router.get(
  '/:id',
  authMiddleware,
  resumeController.getResumeById
);

router.put(
  '/:id',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  updateResumeValidation,
  validateRequest,
  resumeController.updateResume
);

router.delete(
  '/:id',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  resumeController.deleteResume
);

router.post(
  '/:id/parse',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  resumeController.parseResume
);

router.get(
  '/:id/download',
  authMiddleware,
  resumeController.downloadResume
);

router.post(
  '/:id/reprocess',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  resumeController.reprocessResume
);

router.get(
  '/:id/analysis',
  authMiddleware,
  resumeController.getResumeAnalysis
);

router.post(
  '/bulk-upload',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  upload.array('resumes', 10), // Allow up to 10 files
  resumeController.bulkUploadResumes
);

router.post(
  '/:id/extract-skills',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  resumeController.extractSkills
);

router.post(
  '/:id/validate',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  resumeController.validateResume
);

export default router; 