import { Router } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { integrationController } from '../controllers/integrationController';
import { authMiddleware, authorize } from '../middleware/auth';

const router = Router();

// Validation rules
const createIntegrationValidation = [
  body('type')
    .isIn(['linkedin', 'github', 'ats', 'email', 'calendar'])
    .withMessage('Invalid integration type'),
  body('config.apiKey')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('API key cannot be empty if provided'),
  body('config.apiSecret')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('API secret cannot be empty if provided')
];

const updateIntegrationValidation = [
  body('config')
    .isObject()
    .withMessage('Config must be an object'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'error', 'syncing'])
    .withMessage('Invalid status value')
];

// Routes
router.get(
  '/',
  authMiddleware,
  integrationController.getIntegrations
);

router.get(
  '/:id',
  authMiddleware,
  integrationController.getIntegrationById
);

router.post(
  '/',
  authMiddleware,
  authorize('admin'),
  createIntegrationValidation,
  validateRequest,
  integrationController.createIntegration
);

router.put(
  '/:id',
  authMiddleware,
  authorize('admin'),
  updateIntegrationValidation,
  validateRequest,
  integrationController.updateIntegration
);

router.delete(
  '/:id',
  authMiddleware,
  authorize('admin'),
  integrationController.deleteIntegration
);

// LinkedIn Integration
router.get(
  '/linkedin/auth',
  authMiddleware,
  integrationController.linkedinAuth
);

router.get(
  '/linkedin/callback',
  authMiddleware,
  integrationController.linkedinCallback
);

router.get(
  '/linkedin/profile/:candidateId',
  authMiddleware,
  integrationController.getLinkedInProfile
);

router.post(
  '/linkedin/sync',
  authMiddleware,
  integrationController.syncLinkedInData
);

// GitHub Integration
router.get(
  '/github/auth',
  authMiddleware,
  integrationController.githubAuth
);

router.get(
  '/github/callback',
  authMiddleware,
  integrationController.githubCallback
);

router.get(
  '/github/profile/:candidateId',
  authMiddleware,
  integrationController.getGitHubProfile
);

router.post(
  '/github/sync',
  authMiddleware,
  integrationController.syncGitHubData
);

// ATS Integration
router.get(
  '/ats/status',
  authMiddleware,
  integrationController.getATSStatus
);

router.post(
  '/ats/sync',
  authMiddleware,
  integrationController.syncATSData
);

router.get(
  '/ats/candidates',
  authMiddleware,
  integrationController.getATSCandidates
);

// Email Integration
router.get(
  '/email/status',
  authMiddleware,
  integrationController.getEmailStatus
);

router.post(
  '/email/send',
  authMiddleware,
  integrationController.sendEmail
);

router.get(
  '/email/templates',
  authMiddleware,
  integrationController.getEmailTemplates
);

// Calendar Integration
router.get(
  '/calendar/status',
  authMiddleware,
  integrationController.getCalendarStatus
);

router.post(
  '/calendar/event',
  authMiddleware,
  integrationController.createCalendarEvent
);

router.get(
  '/calendar/availability',
  authMiddleware,
  integrationController.getCalendarAvailability
);

// General Integration Management
router.post(
  '/:id/test',
  authMiddleware,
  authorize('admin'),
  integrationController.testIntegration
);

router.post(
  '/:id/sync',
  authMiddleware,
  authorize('admin'),
  integrationController.syncIntegration
);

router.get(
  '/:id/logs',
  authMiddleware,
  integrationController.getIntegrationLogs
);

router.post(
  '/:id/refresh',
  authMiddleware,
  authorize('admin'),
  integrationController.refreshIntegration
);

export default router; 