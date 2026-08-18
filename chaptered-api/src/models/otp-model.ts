const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

interface IOTPDocument {
  _id: string;
  email: string;
  otpHash: string;
  expiresAt: Date | string;
  attempts: number;
  isVerified: boolean;
  verifiedAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  incrementAttempts(): Promise<number>;
  markAsVerified(): Promise<void>;
}

function attachOTPMethods(doc: any): any {
  if (!doc || typeof doc !== 'object') return doc;

  doc._table = 'otps';

  if (!doc.save) {
    doc.save = async function () {
      const { sqliteUpdate } = require('../db/sqlite-init');
      const data: Record<string, any> = {};
      for (const [key, value] of Object.entries(this)) {
        if (key.startsWith('_')) continue;
        if (typeof value === 'function') continue;
        if (key === 'isVerified') {
          data[key] = Boolean(value) ? 1 : 0;
        } else if (value instanceof Date) {
          data[key] = value.toISOString();
        } else {
          data[key] = value;
        }
      }
      sqliteUpdate(this._table, this._id, data);
    };
  }

  doc.incrementAttempts = async function () {
    this.attempts = Number(this.attempts || 0) + 1;
    await this.save();
    return this.attempts;
  };

  doc.markAsVerified = async function () {
    this.isVerified = true;
    this.verifiedAt = new Date().toISOString();
    await this.save();
  };

  return doc;
}

function createMongoOTPModel() {
  const mongoose: any = require('mongoose');

  const otpSchema = new mongoose.Schema(
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
        select: false,
      },
      expiresAt: {
        type: Date,
        required: true,
        index: true,
        expires: 0,
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
    { timestamps: true }
  );

  otpSchema.index({ email: 1, isVerified: 1 });

  otpSchema.statics.findActiveOTP = async function (email: string) {
    return attachOTPMethods(await this.findOne({
      email: email.toLowerCase(),
      isVerified: false,
      expiresAt: { $gt: new Date() },
    }));
  };

  otpSchema.statics.createOTP = async function (email: string, otpHash: string, expiresAt: Date) {
    await this.deleteMany({
      email: email.toLowerCase(),
      isVerified: false,
    });

    return attachOTPMethods(await this.create({
      email: email.toLowerCase(),
      otpHash,
      expiresAt,
    }));
  };

  return mongoose.model('OTP', otpSchema);
}

function createSQLiteOTPModel() {
  const { createSQLiteAdapter } = require('./sqlite-adapter');

  const OTP = createSQLiteAdapter('OTP', {}, { table: 'otps', timestamps: true });

  OTP.findActiveOTP = async function (email: string) {
    const docs = await this.find({
      email: email.toLowerCase(),
      isVerified: 0,
    }).sort({ createdAt: -1 }).limit(1).exec();

    const doc = docs[0] || null;
    if (!doc) return null;

    const expiresAt = new Date(doc.expiresAt);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) return null;
    return attachOTPMethods(doc);
  };

  OTP.createOTP = async function (email: string, otpHash: string, expiresAt: Date) {
    await this.deleteMany({
      email: email.toLowerCase(),
      isVerified: 0,
    });

    const doc = await this.create({
      email: email.toLowerCase(),
      otpHash,
      expiresAt: expiresAt.toISOString(),
      attempts: 0,
      isVerified: false,
      verifiedAt: null,
    });

    return attachOTPMethods(doc);
  };

  return OTP;
}

const OTP = DB_TYPE === 'mongodb' ? createMongoOTPModel() : createSQLiteOTPModel();

export default OTP;
