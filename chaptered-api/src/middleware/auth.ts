/**
 * Authentication middleware for JWT verification.
 * Extracts and validates the JWT Bearer token from the Authorization header and attaches the user's ID to the request.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Authorization header format must be: Bearer <token>' });
  }

  const token = parts[1];

  try {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_here';
    const decoded = jwt.verify(token, secret) as { userId: string };
    
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
