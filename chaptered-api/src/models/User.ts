const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

export let User: any;

if (DB_TYPE === 'mongodb') {
  const mongoose = require('mongoose');
  const { Schema } = mongoose;

  const userSchema = new Schema({
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, match: [/.+\@.+\..+/, 'Please fill a valid email address'] },
    password: { type: String, required: true, minlength: 8 },
    createdAt: { type: Date, default: Date.now },
  });

  const mongooseMod = mongoose as any;
  User = mongooseMod.model('User', userSchema);
} else {
  const { createSQLiteAdapter } = require('./sqlite-adapter');

  User = createSQLiteAdapter('User', {}, { table: 'users' });
}
