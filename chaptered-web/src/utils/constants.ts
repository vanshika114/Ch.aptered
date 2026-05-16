/**
 * API Configuration
 * - In development: http://localhost:5000/api
 * - In production: from environment variable
 */
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Brand Colors (match tailwind.config.js)
 */
export const COLORS = {
  primary: '#1F3864',      // Navy
  secondary: '#4F81BD',    // Sky blue
  accent: '#E8894A',       // Amber
  background: '#FAFAF8'    // Off-white
};

/**
 * Route paths for navigation
 */
export const ROUTES = {
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  books: '/books',
  clubs: '/clubs',
  discover: '/discover',
  profile: '/profile'
};

/**
 * HTTP Status Codes (for error handling)
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500
};