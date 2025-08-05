import { Router } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { jobController } from '../controllers/jobController';
import { authMiddleware, authorize } from '../middleware/auth';

const router = Router();

// Validation rules
const createJobValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Job title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description must be between 50 and 5000 characters'),
  body('requirements')
    .isArray({ min: 1 })
    .withMessage('At least one requirement is required'),
  body('requirements.*.skill')
    .trim()
    .notEmpty()
    .withMessage('Skill name is required'),
  body('requirements.*.level')
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid skill level'),
  body('requirements.*.required')
    .isBoolean()
    .withMessage('Required field must be a boolean'),
  body('requirements.*.weight')
    .isFloat({ min: 0, max: 1 })
    .withMessage('Weight must be between 0 and 1'),
  body('responsibilities')
    .isArray({ min: 1 })
    .withMessage('At least one responsibility is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('type')
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance'])
    .withMessage('Invalid job type'),
  body('level')
    .isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive'])
    .withMessage('Invalid job level'),
  body('salary.min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum salary must be positive'),
  body('salary.max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum salary must be positive'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Invalid deadline date format')
];

const updateJobValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Job title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Job description must be between 50 and 5000 characters'),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'paused', 'closed', 'archived'])
    .withMessage('Invalid job status')
];

const getJobsValidation = [
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
    .isIn(['draft', 'active', 'paused', 'closed', 'archived'])
    .withMessage('Invalid status value'),
  query('type')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance'])
    .withMessage('Invalid job type'),
  query('level')
    .optional()
    .isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive'])
    .withMessage('Invalid job level'),
  query('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty if provided')
];

// Routes
router.get(
  '/',
  authMiddleware,
  getJobsValidation,
  validateRequest,
  jobController.getJobs
);

router.get(
  '/:id',
  authMiddleware,
  jobController.getJobById
);

router.post(
  '/',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  createJobValidation,
  validateRequest,
  jobController.createJob
);

router.put(
  '/:id',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  updateJobValidation,
  validateRequest,
  jobController.updateJob
);

router.delete(
  '/:id',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  jobController.deleteJob
);

router.post(
  '/:id/publish',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  jobController.publishJob
);

router.post(
  '/:id/pause',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  jobController.pauseJob
);

router.post(
  '/:id/close',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  jobController.closeJob
);

router.get(
  '/:id/applications',
  authMiddleware,
  jobController.getJobApplications
);

router.get(
  '/:id/analytics',
  authMiddleware,
  jobController.getJobAnalytics
);

router.post(
  '/:id/duplicate',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  jobController.duplicateJob
);

router.post(
  '/:id/archive',
  authMiddleware,
  authorize('recruiter', 'hiring_manager', 'admin'),
  jobController.archiveJob
);

export default router; 