import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

/**
 * Create router for auth endpoints
 */
const router = Router();

/**
 * Public routes (no auth required)
 */
router.post('/signup', authController.signup);
router.post('/login', authController.login);

/**
 * Protected routes (auth required)
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;