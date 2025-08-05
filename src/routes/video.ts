import { Router } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { videoController } from '../controllers/videoController';
import { authMiddleware, authorize } from '../middleware/auth';

const router = Router();

// Validation rules
const createVideoScreeningValidation = [
  body('screeningId')
    .isUUID()
    .withMessage('Valid screening ID is required'),
  body('candidateId')
    .isUUID()
    .withMessage('Valid candidate ID is required'),
  body('jobId')
    .isUUID()
    .withMessage('Valid job ID is required'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid scheduled date format')
];

const updateVideoScreeningValidation = [
  body('status')
    .optional()
    .isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid scheduled date format')
];

const getVideoScreeningsValidation = [
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
    .isIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
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
router.get(
  '/screenings',
  authMiddleware,
  getVideoScreeningsValidation,
  validateRequest,
  videoController.getVideoScreenings
);

router.get(
  '/screenings/:id',
  authMiddleware,
  videoController.getVideoScreeningById
);

router.post(
  '/screenings',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  createVideoScreeningValidation,
  validateRequest,
  videoController.createVideoScreening
);

router.put(
  '/screenings/:id',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  updateVideoScreeningValidation,
  validateRequest,
  videoController.updateVideoScreening
);

router.delete(
  '/screenings/:id',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  videoController.deleteVideoScreening
);

// Video Screening Management
router.post(
  '/screenings/:id/schedule',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  videoController.scheduleVideoScreening
);

router.post(
  '/screenings/:id/start',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  videoController.startVideoScreening
);

router.post(
  '/screenings/:id/complete',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  videoController.completeVideoScreening
);

router.post(
  '/screenings/:id/cancel',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  videoController.cancelVideoScreening
);

// Video Analysis
router.get(
  '/screenings/:id/analysis',
  authMiddleware,
  videoController.getVideoAnalysis
);

router.post(
  '/screenings/:id/analyze',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  videoController.analyzeVideoScreening
);

// Questions Management
router.get(
  '/screenings/:id/questions',
  authMiddleware,
  videoController.getVideoQuestions
);

router.post(
  '/screenings/:id/questions',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  videoController.addVideoQuestion
);

router.put(
  '/screenings/:id/questions/:questionId',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  videoController.updateVideoQuestion
);

router.delete(
  '/screenings/:id/questions/:questionId',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  videoController.deleteVideoQuestion
);

// Recording Management
router.get(
  '/screenings/:id/recording',
  authMiddleware,
  videoController.getVideoRecording
);

router.post(
  '/screenings/:id/recording',
  authMiddleware,
  videoController.uploadVideoRecording
);

router.delete(
  '/screenings/:id/recording',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  videoController.deleteVideoRecording
);

// Twilio Video Token
router.post(
  '/token',
  authMiddleware,
  videoController.generateVideoToken
);

// Video Room Management
router.post(
  '/rooms',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  videoController.createVideoRoom
);

router.get(
  '/rooms/:roomId',
  authMiddleware,
  videoController.getVideoRoom
);

router.post(
  '/rooms/:roomId/join',
  authMiddleware,
  videoController.joinVideoRoom
);

router.post(
  '/rooms/:roomId/leave',
  authMiddleware,
  videoController.leaveVideoRoom
);

// Video Settings
router.get(
  '/settings',
  authMiddleware,
  videoController.getVideoSettings
);

router.put(
  '/settings',
  authMiddleware,
  authorize('admin'),
  videoController.updateVideoSettings
);

// Video Templates
router.get(
  '/templates',
  authMiddleware,
  videoController.getVideoTemplates
);

router.post(
  '/templates',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  videoController.createVideoTemplate
);

router.put(
  '/templates/:id',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  videoController.updateVideoTemplate
);

router.delete(
  '/templates/:id',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  videoController.deleteVideoTemplate
);

export default router; 