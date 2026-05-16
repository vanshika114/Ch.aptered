/**
 * User interface - what the frontend expects from the backend
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isPremium: boolean;
  createdAt: Date;
}

/**
 * Response from auth endpoints
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Login request body
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Signup request body
 */
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}