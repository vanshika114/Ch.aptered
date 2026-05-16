import api from './api';
import { User, AuthResponse, LoginRequest, SignupRequest } from '@/models/User';

/**
 * Auth service: Handles all authentication API calls
 */
export const authService = {
  /**
   * Sign up new user
   * POST /auth/signup
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  /**
   * Log in existing user
   * POST /auth/login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Get current logged-in user
   * GET /auth/me
   * Requires valid JWT token
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Log out user (client-side only)
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }
};