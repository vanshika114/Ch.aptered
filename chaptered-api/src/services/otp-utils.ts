import crypto from 'crypto';

interface OTPRecord {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const MAX_ATTEMPTS = 5;
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

/**
 * Generate a random 6-digit OTP
 */
export const generateOTP = (): string => {
  return crypto
    .randomBytes(3)
    .readUIntBE(0, 3)
    .toString()
    .slice(0, OTP_LENGTH)
    .padStart(OTP_LENGTH, '0');
};

/**
 * Hash OTP for secure storage
 */
export const hashOTP = (otp: string): string => {
  return crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');
};

/**
 * Verify OTP against hash
 */
export const verifyOTPHash = (otp: string, hash: string): boolean => {
  return hashOTP(otp) === hash;
};

/**
 * Check if OTP has expired
 */
export const isOTPExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

/**
 * Calculate OTP expiry time
 */
export const getOTPExpiryTime = (): Date => {
  const now = new Date();
  return new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

export const OTP_CONFIG = {
  MAX_ATTEMPTS,
  OTP_LENGTH,
  OTP_EXPIRY_MINUTES,
};