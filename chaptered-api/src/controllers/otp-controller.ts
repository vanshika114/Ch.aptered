import { Request, Response } from 'express';
import OTP from '../models/otp-model';
import { User } from '../models/User';
import { generateOTP, hashOTP, verifyOTPHash, isOTPExpired, getOTPExpiryTime, OTP_CONFIG } from '../services/otp-utils';
import { sendOTPEmail } from '../services/email-service';

/**
 * Request OTP for email verification
 * POST /auth/request-otp
 */
export const requestOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser?.isEmailVerified) {
      res.status(400).json({ error: 'Email already verified' });
      return;
    }

    // Check for rate limiting (max 3 OTP requests per hour per email)
    const recentOTPs = await OTP.countDocuments({
      email: email.toLowerCase(),
      createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) },
    });

    if (recentOTPs >= 3) {
      res.status(429).json({
        error: 'Too many OTP requests. Please try again later.',
      });
      return;
    }

    // Generate and hash OTP
    const plainOTP = generateOTP();
    const hashedOTP = hashOTP(plainOTP);
    const expiryTime = getOTPExpiryTime();

    // Save OTP to database
    await OTP.createOTP(email.toLowerCase(), hashedOTP, expiryTime);

    // Send OTP via email
    const userName = existingUser?.name || 'Reader';
    await sendOTPEmail({
      email,
      otp: plainOTP,
      userName,
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: OTP_CONFIG.OTP_EXPIRY_MINUTES * 60, // seconds
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

/**
 * Verify OTP and mark email as verified
 * POST /auth/verify-otp
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      res.status(400).json({ error: 'Email and OTP are required' });
      return;
    }

    if (otp.length !== OTP_CONFIG.OTP_LENGTH) {
      res.status(400).json({ error: 'Invalid OTP format' });
      return;
    }

    // Find active OTP
    const otpRecord = await OTP.findActiveOTP(email.toLowerCase());

    if (!otpRecord) {
      res.status(400).json({ error: 'OTP expired or not found. Please request a new one.' });
      return;
    }

    // Check if OTP has expired
    if (isOTPExpired(otpRecord.expiresAt)) {
      res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      return;
    }

    // Check attempts
    if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      res.status(429).json({ error: 'Too many failed attempts. Please request a new OTP.' });
      return;
    }

    // Get hash from database (it's not selected by default)
    const otpWithHash = await OTP.findById(otpRecord._id).select('+otpHash');
    if (!otpWithHash) {
      res.status(500).json({ error: 'OTP verification failed' });
      return;
    }

    // Verify OTP
    if (!verifyOTPHash(otp, otpWithHash.otpHash)) {
      const newAttempts = await otpRecord.incrementAttempts();

      // Send new OTP if too many failed attempts
      if (newAttempts >= OTP_CONFIG.MAX_ATTEMPTS) {
        const plainOTP = generateOTP();
        const hashedOTP = hashOTP(plainOTP);
        const expiryTime = getOTPExpiryTime();

        await OTP.createOTP(email.toLowerCase(), hashedOTP, expiryTime);
        await sendOTPEmail({
          email,
          otp: plainOTP,
        });

        res.status(400).json({
          error: 'OTP verification failed. A new OTP has been sent.',
        });
      } else {
        res.status(400).json({
          error: 'Invalid OTP',
          attemptsRemaining: OTP_CONFIG.MAX_ATTEMPTS - newAttempts,
        });
      }
      return;
    }

    // Mark OTP as verified
    await otpRecord.markAsVerified();

    // Update user's email verification status
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        email: email.toLowerCase(),
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      });
    } else {
      // Update existing user
      user.isEmailVerified = true;
      user.emailVerifiedAt = new Date();
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
};

/**
 * Resend OTP (rate-limited)
 * POST /auth/resend-otp
 */
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    // Delete existing unverified OTP
    await OTP.deleteMany({
      email: email.toLowerCase(),
      isVerified: false,
    });

    // Generate new OTP
    const plainOTP = generateOTP();
    const hashedOTP = hashOTP(plainOTP);
    const expiryTime = getOTPExpiryTime();

    await OTP.createOTP(email.toLowerCase(), hashedOTP, expiryTime);

    const user = await User.findOne({ email: email.toLowerCase() });
    await sendOTPEmail({
      email,
      otp: plainOTP,
      userName: user?.name,
    });

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      expiresIn: OTP_CONFIG.OTP_EXPIRY_MINUTES * 60,
    });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};