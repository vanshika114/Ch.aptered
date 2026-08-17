import mongoose from 'mongoose';

interface IOTPDocument extends mongoose.Document {
  email: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  isVerified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  incrementAttempts(): Promise<number>;
  markAsVerified(): Promise<void>;
}

const otpSchema = new mongoose.Schema<IOTPDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
      select: false, // Don't return hash by default
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0, // TTL index - auto-delete expired documents
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for active OTP lookups
otpSchema.index({ email: 1, isVerified: 1 });

/**
 * Find active (unverified & not expired) OTP for email
 */
otpSchema.statics.findActiveOTP = async function (email: string) {
  return this.findOne({
    email: email.toLowerCase(),
    isVerified: false,
    expiresAt: { $gt: new Date() },
  });
};

/**
 * Create new OTP record
 */
otpSchema.statics.createOTP = async function (
  email: string,
  otpHash: string,
  expiresAt: Date
) {
  // Delete existing unverified OTPs for this email
  await this.deleteMany({
    email: email.toLowerCase(),
    isVerified: false,
  });

  return this.create({
    email: email.toLowerCase(),
    otpHash,
    expiresAt,
  });
};

/**
 * Increment verification attempts
 */
otpSchema.methods.incrementAttempts = async function () {
  this.attempts += 1;
  await this.save();
  return this.attempts;
};

/**
 * Mark OTP as verified
 */
otpSchema.methods.markAsVerified = async function () {
  this.isVerified = true;
  this.verifiedAt = new Date();
  await this.save();
};

export interface IOTPModel extends mongoose.Model<IOTPDocument> {
  findActiveOTP(email: string): Promise<IOTPDocument | null>;
  createOTP(email: string, otpHash: string, expiresAt: Date): Promise<IOTPDocument>;
}

const OTP = mongoose.model<IOTPDocument, IOTPModel>('OTP', otpSchema);

export default OTP;