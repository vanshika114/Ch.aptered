const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

export let Book: any;

if (DB_TYPE === 'mongodb') {
  const mongoose: any = require('mongoose');
  const Schema = mongoose.Schema;

  const bookSchema = new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      title: { type: String, required: true, trim: true },
      author: { type: String, required: true, trim: true },
      genre: { type: String, default: 'Fiction' },
      pages: { type: Number, required: true, min: 1 },
      desc: { type: String, trim: true },
      color: { type: String, default: '#8B3A3A' },
      hasPdf: { type: Boolean, default: false },
      googleBookId: { type: String },
      coverUrl: { type: String },
    },
    { timestamps: true }
  );
  bookSchema.index({ userId: 1 });

  Book = mongoose.model('Book', bookSchema);
} else {
  const { createSQLiteAdapter } = require('./sqlite-adapter');
  Book = createSQLiteAdapter('Book', {}, { table: 'books', timestamps: true });
}
