/**
 * MongoDB User document interface
 */
export interface IUser {
  _id: string;
  email: string;
  password: string; // This will be hashed
  name: string;
  avatarUrl?: string;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}