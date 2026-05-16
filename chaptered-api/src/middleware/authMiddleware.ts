import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/jwt';

/**
 * Extend Express Request type to include userId
 * This allows req.userId to be used in routes
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Auth middleware: Verify JWT token on protected routes
 *
 * Usage: router.get('/protected-route', authMiddleware, controller.method);
 *
 * Flow:
 * 1. Extract token from "Authorization: Bearer token" header
 * 2. Verify token is valid
 * 3. Add userId to req.userId
 * 4. Call next() to continue to route handler
 * 5. If invalid, return 401 error
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Missing or invalid authorization header' });
      return;
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyJWT(token);

    if (!decoded) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }

    // Attach userId to request for use in route handlers
    req.userId = decoded.userId;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authentication error' });
  }
};