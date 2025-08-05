import { Router } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import { userController } from '../controllers/userController';
import { authMiddleware, authorize } from '../middleware/auth';

const router = Router();

// Validation rules
const createUserValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .isIn(['admin', 'recruiter', 'hiring_manager'])
    .withMessage('Invalid role specified')
];

const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'recruiter', 'hiring_manager'])
    .withMessage('Invalid role specified'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const getUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(['admin', 'recruiter', 'hiring_manager'])
    .withMessage('Invalid role specified'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Routes
router.get(
  '/',
  authMiddleware,
  authorize('admin'),
  getUsersValidation,
  validateRequest,
  userController.getUsers
);

router.get(
  '/:id',
  authMiddleware,
  userController.getUserById
);

router.post(
  '/',
  authMiddleware,
  authorize('admin'),
  createUserValidation,
  validateRequest,
  userController.createUser
);

router.put(
  '/:id',
  authMiddleware,
  authorize('admin'),
  updateUserValidation,
  validateRequest,
  userController.updateUser
);

router.delete(
  '/:id',
  authMiddleware,
  authorize('admin'),
  userController.deleteUser
);

router.post(
  '/:id/activate',
  authMiddleware,
  authorize('admin'),
  userController.activateUser
);

router.post(
  '/:id/deactivate',
  authMiddleware,
  authorize('admin'),
  userController.deactivateUser
);

router.get(
  '/:id/activity',
  authMiddleware,
  userController.getUserActivity
);

router.post(
  '/:id/reset-password',
  authMiddleware,
  authorize('admin'),
  userController.resetUserPassword
);

export default router; 