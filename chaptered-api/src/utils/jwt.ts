import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export const generateJWT = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };

  return jwt.sign({ userId }, JWT_SECRET, options);
};

export const verifyJWT = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'userId' in decoded
    ) {
      return { userId: decoded.userId as string };
    }

    return null;
  } catch {
    return null;
  }
};