/**
 * Express router for authentication routes.
 * Implements signup, login, and get profile endpoints.
 */
import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { auth, AuthRequest } from '../middleware/auth';

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

// GET /api/auth/me (Protected)
router.get('/me', auth, async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User ID missing from authentication state' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User no longer exists' });
    }

    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('[Auth Me Error]:', error);
    return res.status(500).json({ error: 'Server error fetching user profile.' });
  }
});

export default router;
