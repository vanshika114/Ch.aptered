const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

export let ReadingSession: any;

if (DB_TYPE === 'mongodb') {
  const mongoose = require('mongoose');
  const { Schema } = mongoose;

  const readingSessionSchema = new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      bookId: { type: String, required: true },
      bookTitle: { type: String, required: true, trim: true },
      bookAuthor: { type: String, trim: true },
      bookCoverUrl: { type: String, trim: true },
      startedAt: { type: Date, default: Date.now, required: true },
      endedAt: { type: Date },
      pagesRead: { type: Number, default: 0, min: 0, required: true },
      notes: { type: String, maxlength: 1000, trim: true },
      status: { type: String, enum: ['reading', 'completed', 'paused', 'abandoned'], default: 'reading', required: true },
    },
    { timestamps: true }
  );
  readingSessionSchema.index({ userId: 1, bookId: 1 });

  const mongooseMod = mongoose as any;
  ReadingSession = mongooseMod.model('ReadingSession', readingSessionSchema);
} else {
  const { createSQLiteAdapter } = require('./sqlite-adapter');
  ReadingSession = createSQLiteAdapter('ReadingSession', {}, { table: 'reading_sessions', timestamps: true });
}
