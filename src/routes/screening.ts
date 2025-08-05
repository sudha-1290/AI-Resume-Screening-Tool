import { Router } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { screeningController } from '../controllers/screeningController';
import { authMiddleware, authorize } from '../middleware/auth';

const router = Router();

// Validation rules
const createScreeningValidation = [
  body('jobId')
    .isUUID()
    .withMessage('Valid job ID is required'),
  body('resumeId')
    .isUUID()
    .withMessage('Valid resume ID is required'),
  body('candidateId')
    .isUUID()
    .withMessage('Valid candidate ID is required')
];

const updateScreeningValidation = [
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'reviewed', 'rejected'])
    .withMessage('Invalid status value'),
  body('score')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100')
];

const getScreeningsValidation = [
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
    .isIn(['pending', 'in_progress', 'completed', 'reviewed', 'rejected'])
    .withMessage('Invalid status value'),
  query('jobId')
    .optional()
    .isUUID()
    .withMessage('Valid job ID is required if provided'),
  query('candidateId')
    .optional()
    .isUUID()
    .withMessage('Valid candidate ID is required if provided')
];

// Routes
router.get(
  '/',
  authMiddleware,
  getScreeningsValidation,
  validateRequest,
  screeningController.getScreenings
);

router.get(
  '/:id',
  authMiddleware,
  screeningController.getScreeningById
);

router.post(
  '/',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  createScreeningValidation,
  validateRequest,
  screeningController.createScreening
);

router.put(
  '/:id',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  updateScreeningValidation,
  validateRequest,
  screeningController.updateScreening
);

router.delete(
  '/:id',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  screeningController.deleteScreening
);

router.post(
  '/:id/start',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  screeningController.startScreening
);

router.post(
  '/:id/complete',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  screeningController.completeScreening
);

router.get(
  '/:id/analysis',
  authMiddleware,
  screeningController.getScreeningAnalysis
);

router.post(
  '/:id/notes',
  authMiddleware,
  screeningController.addReviewerNote
);

router.get(
  '/:id/notes',
  authMiddleware,
  screeningController.getReviewerNotes
);

router.post(
  '/bulk',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  screeningController.bulkScreening
);

router.get(
  '/:id/progress',
  authMiddleware,
  screeningController.getScreeningProgress
);

export default router; 