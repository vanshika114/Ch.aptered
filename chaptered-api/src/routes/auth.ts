/**
 * Express router for authentication routes.
 * Implements signup, login, and get profile endpoints.
 */
import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req, res): Promise<any> => {
  const { username, email, password } = req.body;

  // 1. Input Validation
  const errors: Record<string, string> = {};
  
  if (!username || username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  }
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Invalid email address format';
  }
  
  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // 2. Check for duplicate credentials
    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ errors: { email: 'Email is already registered' } });
    }

    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      return res.status(400).json({ errors: { username: 'Username is already taken' } });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create and save user
    const user = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });
    await user.save();

    const secret = process.env.JWT_SECRET || 'your_jwt_secret_here';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: expiresIn as SignOptions['expiresIn'] });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Signup Error]:', error);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res): Promise<any> => {
  const { email, password } = req.body;

  // 1. Validation
  const errors: Record<string, string> = {};
  if (!email) errors.email = 'Email is required';
  if (!password) errors.password = 'Password is required';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // 2. Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const secret = process.env.JWT_SECRET || 'your_jwt_secret_here';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: expiresIn as SignOptions['expiresIn'] });

    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res): Promise<any> => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    // Always return success to avoid revealing whether email exists
    if (user) {
      const resetToken = jwt.sign({ userId: user._id, purpose: 'password-reset' }, process.env.JWT_SECRET || 'your_jwt_secret_here', { expiresIn: '1h' });
      console.log(`[Password Reset] Token for ${email}: ${resetToken}`);
      // In production, send email with reset link
    }
    return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res): Promise<any> => {
  const { token, password } = req.body;

  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'Valid token and password (min 8 chars) are required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here') as { userId: string; purpose: string };
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ error: 'Invalid token purpose' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });
    return res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    return res.status(400).json({ error: 'Invalid or expired token.' });
  }
});

// GET /api/auth/check-username/:username
router.get('/check-username/:username', async (req, res): Promise<any> => {
  try {
    const { username } = req.params;
    if (!username || username.trim().length < 1) {
      return res.json({ available: false, error: 'Username is required' });
    }

    const existing = await User.findOne({ username: username.trim() });
    const available = !existing;

    const suggestions: string[] = [];
    if (!available) {
      const base = username.trim();
      const suffixes = ['1', '2', '3', '_read', '_books', '_reader', Math.floor(Math.random() * 999).toString()];
      for (const s of suffixes) {
        const candidate = `${base}${s}`;
        const taken = await User.findOne({ username: candidate });
        if (!taken) suggestions.push(candidate);
        if (suggestions.length >= 3) break;
      }
    }

    return res.json({ available, suggestions });
  } catch (error) {
    console.error('[Check Username Error]:', error);
    return res.status(500).json({ error: 'Server error checking username.' });
  }
});

export default router;
