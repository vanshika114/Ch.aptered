import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '@utils/constants';

/**
 * Create axios instance with base URL
 * This is used for all API calls
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor: Add JWT token to all requests
 * - Gets token from localStorage
 * - Adds it to Authorization header: "Bearer token..."
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor: Handle auth errors
 * - If we get 401 (Unauthorized), token is expired
 * - Clear token and redirect to login
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      // Redirect to login on next page load
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;