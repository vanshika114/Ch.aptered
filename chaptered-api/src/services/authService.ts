import User, { IUser } from '../models/User';
import { generateJWT } from '../utils/jwt';

/**
 * Data needed for signup
 */
interface SignupData {
  email: string;
  password: string;
  name: string;
}

/**
 * Response from auth (user + token)
 */
interface AuthResponse {
  user: IUser;
  token: string;
}

/**
 * Auth service: Business logic for authentication
 */
export class AuthService {
  /**
   * Sign up new user
   * 1. Check if email already exists
   * 2. Create new user in MongoDB
   * 3. Generate JWT token
   * 4. Return user and token
   *
   * @throws Error if email already registered
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await User.findOne({ 
      email: data.email.toLowerCase() 
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create new user document
    const user = new User({
      email: data.email.toLowerCase(),
      name: data.name,
      password: data.password
      // Password will be hashed by pre-save middleware
    });

    // Save to MongoDB
    await user.save();

    // Generate JWT token
    const token = generateJWT(user._id.toString());

    return {
      user: user.toJSON() as IUser,
      token
    };
  }

  /**
   * Log in existing user
   * 1. Find user by email
   * 2. Check if password matches
   * 3. Generate JWT token
   * 4. Return user and token
   *
   * @throws Error if email not found or password wrong
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user (must include password field even though it's normally hidden)
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('+password');

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if password matches
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateJWT(user._id.toString());

    return {
      user: user.toJSON() as IUser,
      token
    };
  }

  /**
   * Get user by ID
   * Used by middleware to fetch current user
   *
   * @param userId - MongoDB ObjectId as string
   * @throws Error if user not found
   */
  async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.toJSON() as IUser;
  }
}

export default new AuthService();