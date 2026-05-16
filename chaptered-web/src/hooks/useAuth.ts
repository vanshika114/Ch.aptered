import { useAuthStore } from '@store/authStore';
import { useEffect } from 'react';

/**
 * Custom hook to use auth store
 * Wraps Zustand store and adds automatic user loading on mount
 *
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const store = useAuthStore();

  // Load user on component mount if token exists
  useEffect(() => {
    if (store.token && !store.user) {
      store.loadUser();
    }
  }, []);

  // Return all useful auth state and methods
  return {
    user: store.user,
    token: store.token,
    isLoading: store.isLoading,
    error: store.error,
    signup: store.signup,
    login: store.login,
    logout: store.logout,
    clearError: store.clearError,
    isAuthenticated: !!store.token // True if token exists
  };
};