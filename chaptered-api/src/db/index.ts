const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

export function isMongoDB(): boolean {
  return DB_TYPE === 'mongodb';
}

export function getDBType(): string {
  return DB_TYPE;
}

export function initDatabase() {
  if (isMongoDB()) {
    const mongoose = require('mongoose');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaptered';
    mongoose.connect(MONGODB_URI)
      .then(() => console.log('[DB] MongoDB connected successfully'))
      .catch((err: any) => console.error('[DB] MongoDB connection error:', err));
    console.log(`[DB] Using MongoDB at ${MONGODB_URI}`);
  } else {
    const { getDb } = require('./sqlite-init');
    const dbPath = process.env.SQLITE_DB_PATH || './chaptered.sqlite';
    getDb();
    console.log(`[DB] Using SQLite at ${dbPath}`);
  }
}
