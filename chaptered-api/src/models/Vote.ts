const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

export let Vote: any;

if (DB_TYPE === 'mongodb') {
  const mongoose: any = require('mongoose');
  const Schema = mongoose.Schema;

  const voteSchema = new Schema(
    {
      clubId: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      nomineeId: { type: String, required: true },
      nomineeTitle: { type: String, required: true },
      nomineeAuthor: { type: String },
      nomineeCoverUrl: { type: String },
    },
    { timestamps: true }
  );
  voteSchema.index({ clubId: 1, userId: 1 }, { unique: true });
  voteSchema.index({ clubId: 1, nomineeId: 1 });

  Vote = mongoose.model('Vote', voteSchema);
} else {
  const { createSQLiteAdapter } = require('./sqlite-adapter');
  Vote = createSQLiteAdapter('Vote', {}, { table: 'votes', timestamps: true });
}
