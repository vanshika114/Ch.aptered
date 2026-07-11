import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.SQLITE_DB_PATH || './chaptered.sqlite';
    db = new Database(path.resolve(dbPath));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    createTables(db);
  }
  return db;
}

function createTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      _id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reading_sessions (
      _id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(_id),
      bookId TEXT NOT NULL,
      bookTitle TEXT NOT NULL,
      bookAuthor TEXT,
      bookCoverUrl TEXT,
      startedAt TEXT DEFAULT (datetime('now')),
      endedAt TEXT,
      pagesRead INTEGER DEFAULT 0,
      notes TEXT,
      status TEXT DEFAULT 'reading' CHECK(status IN ('reading','completed','paused','abandoned')),
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clubs (
      _id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      type TEXT DEFAULT 'public' CHECK(type IN ('public','semi_private','private')),
      isPublic INTEGER DEFAULT 1,
      invite_code TEXT,
      owner TEXT NOT NULL REFERENCES users(_id),
      currentBookId TEXT,
      currentBookTitle TEXT,
      currentBookAuthor TEXT,
      currentBookCoverUrl TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS club_members (
      clubId TEXT NOT NULL REFERENCES clubs(_id),
      userId TEXT NOT NULL REFERENCES users(_id),
      role TEXT DEFAULT 'member' CHECK(role IN ('admin','member')),
      status TEXT DEFAULT 'active' CHECK(status IN ('active','pending_approval')),
      PRIMARY KEY (clubId, userId)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      _id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(_id),
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      relatedClubId TEXT,
      isRead INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS votes (
      _id TEXT PRIMARY KEY,
      clubId TEXT NOT NULL REFERENCES clubs(_id),
      userId TEXT NOT NULL REFERENCES users(_id),
      nomineeId TEXT NOT NULL,
      nomineeTitle TEXT NOT NULL,
      nomineeAuthor TEXT,
      nomineeCoverUrl TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_vote_unique ON votes(clubId, userId);

    CREATE TABLE IF NOT EXISTS books (
      _id TEXT PRIMARY KEY,
      userId TEXT NOT NULL REFERENCES users(_id),
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT DEFAULT 'Fiction',
      pages INTEGER NOT NULL,
      desc TEXT,
      color TEXT DEFAULT '#8B3A3A',
      hasPdf INTEGER DEFAULT 0,
      pdf TEXT,
      googleBookId TEXT,
      coverUrl TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );
  `);

  // Migrations for existing databases
  const bookCols = db.prepare(`PRAGMA table_info(books)`).all() as any[];
  if (!bookCols.some((c: any) => c.name === 'pdf')) {
    db.exec(`ALTER TABLE books ADD COLUMN pdf BLOB`);
  }
  const cols = db.prepare(`PRAGMA table_info(clubs)`).all() as any[];
  if (!cols.some((c: any) => c.name === 'type')) {
    db.exec(`ALTER TABLE clubs ADD COLUMN type TEXT DEFAULT 'public' CHECK(type IN ('public','semi_private','private'))`);
  }
  if (!cols.some((c: any) => c.name === 'invite_code')) {
    db.exec(`ALTER TABLE clubs ADD COLUMN invite_code TEXT`);
  }
  const memberCols = db.prepare(`PRAGMA table_info(club_members)`).all() as any[];
  if (!memberCols.some((c: any) => c.name === 'role')) {
    db.exec(`ALTER TABLE club_members ADD COLUMN role TEXT DEFAULT 'member' CHECK(role IN ('admin','member'))`);
  }
  if (!memberCols.some((c: any) => c.name === 'status')) {
    db.exec(`ALTER TABLE club_members ADD COLUMN status TEXT DEFAULT 'active' CHECK(status IN ('active','pending_approval'))`);
  }
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function toSqlValue(val: any): any {
  if (val === undefined) return null;
  if (typeof val === 'boolean') return val ? 1 : 0;
  return val;
}

export function sqliteQuery(
  table: string,
  conditions: Record<string, any>,
  options?: { sort?: Record<string, -1 | 1>; limit?: number; skip?: number }
) {
  const d = getDb();
  const where: string[] = [];
  const params: any[] = [];

  for (const [key, value] of Object.entries(conditions)) {
    if (value === undefined) continue;
    if (value && typeof value === 'object' && '$ne' in value) {
      where.push(`${key} != ?`);
      params.push(toSqlValue(value.$ne));
    } else if (value && typeof value === 'object' && '$in' in value) {
      const placeholders = value.$in.map(() => '?').join(',');
      where.push(`${key} IN (${placeholders})`);
      params.push(...(value.$in as any[]).map(toSqlValue));
    } else if (value && typeof value === 'object' && '$regex' in value) {
      where.push(`${key} LIKE ?`);
      params.push(`%${value.$regex}%`);
    } else {
      where.push(`${key} = ?`);
      params.push(toSqlValue(value));
    }
  }

  let sql = `SELECT * FROM ${table}`;
  if (where.length > 0) sql += ` WHERE ${where.join(' AND ')}`;
  if (options?.sort) {
    const orderBy = Object.entries(options.sort)
      .map(([k, v]) => `${k} ${v === -1 ? 'DESC' : 'ASC'}`)
      .join(', ');
    sql += ` ORDER BY ${orderBy}`;
  }
  if (options?.limit) sql += ` LIMIT ?`;
  if (options?.limit) params.push(options.limit);
  if (options?.skip) sql += ` OFFSET ?`;
  if (options?.skip) params.push(options.skip);

  return d.prepare(sql).all(...params);
}

export function sqliteFindOne(table: string, conditions: Record<string, any>) {
  const results = sqliteQuery(table, conditions, { limit: 1 });
  return results[0] || null;
}

export function sqliteCount(table: string, conditions: Record<string, any>) {
  const d = getDb();
  const where: string[] = [];
  const params: any[] = [];
  for (const [key, value] of Object.entries(conditions)) {
    if (value === undefined) continue;
    where.push(`${key} = ?`);
    params.push(toSqlValue(value));
  }
  let sql = `SELECT COUNT(*) as count FROM ${table}`;
  if (where.length > 0) sql += ` WHERE ${where.join(' AND ')}`;
  const row = d.prepare(sql).get(...params) as any;
  return row?.count || 0;
}

export function sqliteInsert(table: string, data: Record<string, any>) {
  const d = getDb();
  const keys = Object.keys(data);
  const values = keys.map((k) => toSqlValue(data[k]));
  const placeholders = keys.map(() => '?').join(',');
  const cols = keys.join(', ');
  d.prepare(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`).run(...values);
}

export function sqliteUpdate(table: string, id: string, data: Record<string, any>) {
  const d = getDb();
  const keys = Object.keys(data);
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = [...keys.map((k) => toSqlValue(data[k])), id];
  d.prepare(`UPDATE ${table} SET ${setClause} WHERE _id = ?`).run(...values);
}

export function sqliteDelete(table: string, conditions: Record<string, any>) {
  const d = getDb();
  const where: string[] = [];
  const params: any[] = [];
  for (const [key, value] of Object.entries(conditions)) {
    if (value === undefined) continue;
    where.push(`${key} = ?`);
    params.push(toSqlValue(value));
  }
  if (where.length === 0) return;
  d.prepare(`DELETE FROM ${table} WHERE ${where.join(' AND ')}`).run(...params);
}
