/**
 * Unit tests for input validation helpers.
 * Verifies validation rules for email syntax, username lengths, and password constraints.
 */
import { isValidEmail, isValidUsername, isValidPassword } from '../utils/validation';

describe('Validation Utility Helpers', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid email formats', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('plain-text')).toBe(false);
      expect(isValidEmail('@missing-username.com')).toBe(false);
      expect(isValidEmail('username@missing-tld.')).toBe(false);
    });
  });

  describe('isValidUsername', () => {
    it('should return true for usernames with 3 or more characters', () => {
      expect(isValidUsername('abc')).toBe(true);
      expect(isValidUsername('my_username')).toBe(true);
    });

    it('should return false for empty or short usernames', () => {
      expect(isValidUsername('')).toBe(false);
      expect(isValidUsername('ab')).toBe(false);
      expect(isValidUsername('  ')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for passwords with 8 or more characters', () => {
      expect(isValidPassword('12345678')).toBe(true);
      expect(isValidPassword('secure_password_123')).toBe(true);
    });

    it('should return false for empty or short passwords', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('1234567')).toBe(false);
    });
  });
});
