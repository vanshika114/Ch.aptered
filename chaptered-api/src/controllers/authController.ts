import { Request, Response } from 'express';
import authService from '../services/authService';

/**
 * Auth controller: Handles auth HTTP requests
 * - Receives requests from routes
 * - Calls service layer for business logic
 * - Returns responses to client
 */
export const authController = {
  /**
   * POST /auth/signup
   * Create new user account
   */
  async signup(req: Request, res: Response): Promise<void> {
    try {
      // Get data from request body
      const { email, password, name } = req.body;

      // Validate input
      if (!email || !password || !name) {
        res.status(400).json({ message: 'Email, password, and name are required' });
        return;
      }

      // Call service to create user
      const result = await authService.signup({ email, password, name });

      // Return 201 Created with user and token
      res.status(201).json(result);
    } catch (error: any) {
      // If service threw error, return 400 Bad Request
      res.status(400).json({ message: error.message });
    }
  },

  /**
   * POST /auth/login
   * Log in existing user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const result = await authService.login(email, password);
      res.json(result); // 200 OK
    } catch (error: any) {
      // Wrong email or password
      res.status(401).json({ message: error.message });
    }
  },

  /**
   * GET /auth/me
   * Get current logged-in user
   * Requires valid JWT token (authMiddleware checks this)
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // req.userId was set by authMiddleware
      if (!req.userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const user = await authService.getUserById(req.userId);
      res.json(user);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
};