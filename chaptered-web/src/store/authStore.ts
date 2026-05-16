import { create } from 'zustand';
import { User } from '@/models/User';
import { authService } from '@services/auth';

/**
 * Auth store state
 * - user: Currently logged-in user (null if not logged in)
 * - token: JWT token (stored in localStorage too)
 * - isLoading: Whether an auth request is in progress
 * - error: Error message if auth failed
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions (methods to change state)
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

/**
 * Create store with initial state and actions
 * Zustand automatically manages state updates
 */
export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  token: localStorage.getItem('authToken'), // Persist across page refreshes
  isLoading: false,
  error: null,

  // Action: Sign up
  signup: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.signup({ email, password, name });
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
      set({ user, token, isLoading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Signup failed';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  // Action: Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login({ email, password });
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
      set({ user, token, isLoading: false });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  // Action: Logout
  logout: () => {
    authService.logout();
    set({ user: null, token: null });
  },

  // Action: Load user from token (on app startup)
  loadUser: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  // Action: Clear error message
  clearError: () => set({ error: null })
}));