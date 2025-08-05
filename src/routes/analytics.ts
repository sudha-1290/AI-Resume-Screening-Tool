import { Router } from 'express';
import { query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { analyticsController } from '../controllers/analyticsController';
import { authMiddleware, authorize } from '../middleware/auth';

const router = Router();

// Validation rules
const analyticsValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  query('type')
    .optional()
    .isIn(['diversity', 'skills', 'performance', 'hiring_funnel', 'time_to_hire'])
    .withMessage('Invalid analytics type'),
  query('department')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department cannot be empty if provided'),
  query('jobLevel')
    .optional()
    .isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive'])
    .withMessage('Invalid job level')
];

// Routes
router.get(
  '/dashboard',
  authMiddleware,
  analyticsController.getDashboardAnalytics
);

router.get(
  '/diversity',
  authMiddleware,
  authorize('admin', 'hiring_manager'),
  analyticsValidation,
  validateRequest,
  analyticsController.getDiversityAnalytics
);

router.get(
  '/skills',
  authMiddleware,
  analyticsValidation,
  validateRequest,
  analyticsController.getSkillsAnalytics
);

router.get(
  '/performance',
  authMiddleware,
  analyticsValidation,
  validateRequest,
  analyticsController.getPerformanceAnalytics
);

router.get(
  '/hiring-funnel',
  authMiddleware,
  analyticsValidation,
  validateRequest,
  analyticsController.getHiringFunnelAnalytics
);

router.get(
  '/time-to-hire',
  authMiddleware,
  analyticsValidation,
  validateRequest,
  analyticsController.getTimeToHireAnalytics
);

router.get(
  '/bias-analysis',
  authMiddleware,
  authorize('admin', 'hiring_manager'),
  analyticsValidation,
  validateRequest,
  analyticsController.getBiasAnalysis
);

router.get(
  '/candidate-quality',
  authMiddleware,
  analyticsValidation,
  validateRequest,
  analyticsController.getCandidateQualityAnalytics
);

router.get(
  '/screening-efficiency',
  authMiddleware,
  analyticsValidation,
  validateRequest,
  analyticsController.getScreeningEfficiencyAnalytics
);

router.get(
  '/cost-analysis',
  authMiddleware,
  authorize('admin'),
  analyticsValidation,
  validateRequest,
  analyticsController.getCostAnalysis
);

router.get(
  '/export/:type',
  authMiddleware,
  analyticsController.exportAnalytics
);

router.get(
  '/reports',
  authMiddleware,
  analyticsController.getReports
);

router.post(
  '/reports',
  authMiddleware,
  authorize('admin', 'hiring_manager'),
  analyticsController.generateReport
);

export default router; 