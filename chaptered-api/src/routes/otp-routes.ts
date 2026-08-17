import express, { NextFunction, Request, Response, Router } from 'express';
import { requestOTP, verifyOTP, resendOTP } from '../controllers/otp-controller';
import { otpLimiter } from '../middleware/rateLimiter';
import { isValidEmail } from '../utils/validation';

const router: Router = express.Router();

const validateEmail = (req: Request, res: Response, next: NextFunction): void => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }

  next();
};

const validateOtpVerification = (req: Request, res: Response, next: NextFunction): void => {
  const { email, otp } = req.body;

  if (!email || !isValidEmail(email)) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }

  if (!otp || typeof otp !== 'string' || otp.length !== 6) {
    res.status(400).json({ error: 'Invalid OTP format' });
    return;
  }

  next();
};

/**
 * POST /auth/request-otp
 * Request OTP for email verification
 * Body: { email: string }
 */
router.post('/request-otp', otpLimiter, validateEmail, requestOTP);

/**
 * POST /auth/verify-otp
 * Verify OTP and complete email verification
 * Body: { email: string, otp: string }
 */
router.post('/verify-otp', otpLimiter, validateOtpVerification, verifyOTP);

/**
 * POST /auth/resend-otp
 * Resend OTP to email
 * Body: { email: string }
 */
router.post('/resend-otp', otpLimiter, validateEmail, resendOTP);

export default router;