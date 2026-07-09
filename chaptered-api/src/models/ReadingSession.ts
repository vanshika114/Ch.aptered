/**
 * ReadingSession model representing individual reading progress records.
 * Stores book meta-details, progress count, status, user notes, and associations.
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface IReadingSession extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: string;
  bookTitle: string;
  bookAuthor?: string;
  bookCoverUrl?: string;
  startedAt: Date;
  endedAt?: Date;
  pagesRead: number;
  notes?: string;
  status: 'reading' | 'completed' | 'paused' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

const readingSessionSchema = new Schema<IReadingSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookId: {
      type: String,
      required: true,
    },
    bookTitle: {
      type: String,
      required: true,
      trim: true,
    },
    bookAuthor: {
      type: String,
      trim: true,
    },
    bookCoverUrl: {
      type: String,
      trim: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    endedAt: {
      type: Date,
    },
    pagesRead: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    notes: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    status: {
      type: String,
      enum: ['reading', 'completed', 'paused', 'abandoned'],
      default: 'reading',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index on userId and bookId for fast lookups
readingSessionSchema.index({ userId: 1, bookId: 1 });

export const ReadingSession = mongoose.model<IReadingSession>('ReadingSession', readingSessionSchema);
