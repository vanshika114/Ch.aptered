/**
 * Express router for Reading Session endpoints.
 * Mounts secure CRUD routes protected by JWT auth middleware.
 */
import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createSession,
  getUserSessions,
  updateSession,
  deleteSession,
} from '../controllers/readingSessionController';

const router = Router();

// Apply JWT Authentication middleware to all routes
router.use(auth);

// CRUD Route mapping
router.post('/', createSession);
router.get('/', getUserSessions);
router.patch('/:id', updateSession);
router.delete('/:id', deleteSession);

export default router;
