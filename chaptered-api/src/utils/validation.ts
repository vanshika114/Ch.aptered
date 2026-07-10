/**
 * Validation utility helpers for input parameters.
 * Provides helper functions for validating email format, username length, and password strength.
 */

export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidUsername = (username: string): boolean => {
  if (!username) return false;
  return username.trim().length >= 3;
};

export const isValidPassword = (password: string): boolean => {
  if (!password) return false;
  return password.length >= 8;
};
