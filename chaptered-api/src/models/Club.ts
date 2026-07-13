const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

export let Club: any;

if (DB_TYPE === 'mongodb') {
  const mongoose: any = require('mongoose');
  const Schema = mongoose.Schema;

  const clubSchema = new Schema(
    {
      name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
      description: { type: String, required: true, trim: true, maxlength: 2000 },
      type: { type: String, enum: ['public', 'semi_private', 'private'], default: 'public' },
      isPublic: { type: Boolean, default: true },
      inviteCode: { type: String },
      owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      currentBook: {
        bookId: { type: String },
        title: { type: String },
        author: { type: String },
        coverUrl: { type: String },
      },
    },
    { timestamps: true }
  );
  clubSchema.index({ name: 'text', description: 'text' });

  Club = mongoose.model('Club', clubSchema);
} else {
  const { getDb, generateId, sqliteQuery, sqliteFindOne, sqliteCount, sqliteInsert, sqliteUpdate, sqliteDelete } = require('../db/sqlite-init');

  const table = 'clubs';
  const memberTable = 'club_members';

  function rowToClub(row: any) {
    if (!row) return null;
    return {
      ...row,
      _id: String(row._id),
      type: row.type || 'public',
      isPublic: row.type !== 'private',
      inviteCode: row.invite_code || null,
      members: [],
      currentBook: row.currentBookId ? {
        bookId: row.currentBookId,
        title: row.currentBookTitle,
        author: row.currentBookAuthor,
        coverUrl: row.currentBookCoverUrl,
      } : undefined,
    };
  }

  function loadMembers(club: any) {
    const db = getDb();
    const rows = db.prepare(`SELECT userId, role, status FROM ${memberTable} WHERE clubId = ?`).all(club._id);
    club.members = rows.map((r: any) => r.userId);
    club.memberRoles = Object.fromEntries(rows.filter((r: any) => r.status === 'active').map((r: any) => [r.userId, r.role]));
    club.pendingMembers = rows.filter((r: any) => r.status === 'pending_approval').map((r: any) => r.userId);
    return club;
  }

  function populateMembers(club: any, fields = 'username email') {
    if (!club) return club;
    const db = getDb();
    const rows = db.prepare(
      `SELECT cm.userId, cm.role, cm.status, u._id, u.username, u.email FROM ${memberTable} cm JOIN users u ON u._id = cm.userId WHERE cm.clubId = ?`
    ).all(club._id);
    club.members = rows.map((r: any) => ({ _id: r._id, username: r.username, email: r.email }));
    return club;
  }

  function populateOwner(club: any) {
    if (!club) return club;
    const db = getDb();
    if (club.owner) {
      const user = db.prepare('SELECT _id, username, email FROM users WHERE _id = ?').get(club.owner);
      if (user) club.owner = { _id: user._id, username: user.username, email: user.email };
    }
    return club;
  }

  function copyDoc(doc: any) {
    const data: any = {};
    for (const key of Object.keys(doc)) {
      if (key === 'members' || key === 'currentBook' || key.startsWith('_')) continue;
      if (typeof doc[key] === 'function') continue;
      const dbKey = key === 'inviteCode' ? 'invite_code' : key;
      data[dbKey] = doc[key];
    }
    if (doc.currentBook) {
      data.currentBookId = doc.currentBook.bookId || null;
      data.currentBookTitle = doc.currentBook.title || null;
      data.currentBookAuthor = doc.currentBook.author || null;
      data.currentBookCoverUrl = doc.currentBook.coverUrl || null;
    } else {
      data.currentBookId = null;
      data.currentBookTitle = null;
      data.currentBookAuthor = null;
      data.currentBookCoverUrl = null;
    }
    return data;
  }

  function syncMembers(clubId: string, memberIds: string[]) {
    const db = getDb();
    const existing = db.prepare(`SELECT userId, role, status FROM ${memberTable} WHERE clubId = ?`).all(clubId) as any[];
    const existingMap = new Map(existing.map((r: any) => [r.userId, { role: r.role, status: r.status }]));
    const del = db.prepare(`DELETE FROM ${memberTable} WHERE clubId = ?`);
    const ins = db.prepare(`INSERT OR REPLACE INTO ${memberTable} (clubId, userId, role, status) VALUES (?, ?, ?, ?)`);
    del.run(clubId);
    for (const uid of memberIds) {
      const prev = existingMap.get(uid);
      const role = prev?.role || 'member';
      const status = prev?.status || 'active';
      ins.run(clubId, uid, role, status);
    }
  }

  function wrapDoc(doc: any) {
    doc._isNew = false;
    doc.save = function () {
      const data = copyDoc(this);
      data.updatedAt = new Date().toISOString();
      sqliteUpdate(table, this._id, data);
      syncMembers(this._id, this.members.map((m: any) => (typeof m === 'string' ? m : m._id)));
    };
    doc.deleteOne = function () {
      sqliteDelete(table, { _id: this._id });
      const db = getDb();
      db.prepare(`DELETE FROM ${memberTable} WHERE clubId = ?`).run(this._id);
    };
    doc.populate = function (field: string) {
      if (field === 'members') populateMembers(doc);
      if (field === 'owner') populateOwner(doc);
      return this;
    };
    return doc;
  }

  Club = function (this: any, data: any) {
    const now = new Date().toISOString();
    this._id = generateId();
    this._isNew = true;
    this.name = data.name || '';
    this.description = data.description || '';
    this.type = data.type || 'public';
    this.isPublic = data.type !== 'private';
    this.inviteCode = data.inviteCode || null;
    this.owner = data.owner;
    this.members = data.members || [];
    this.currentBook = data.currentBook || undefined;
    if (data.createdAt) this.createdAt = data.createdAt;
    else this.createdAt = now;
    this.updatedAt = now;
  } as any;

  Club.prototype.save = function () {
    const data = copyDoc(this);
    if (this._isNew) {
      data._id = this._id;
      if (!data.createdAt) data.createdAt = new Date().toISOString();
      sqliteInsert(table, data);
      syncMembers(this._id, this.members.map((m: any) => (typeof m === 'string' ? m : m._id)));
      this._isNew = false;
    } else {
      data.updatedAt = new Date().toISOString();
      sqliteUpdate(table, this._id, data);
      syncMembers(this._id, this.members.map((m: any) => (typeof m === 'string' ? m : m._id)));
    }
  };

  Club.prototype.deleteOne = function () {
    sqliteDelete(table, { _id: this._id });
    const db = getDb();
    db.prepare(`DELETE FROM ${memberTable} WHERE clubId = ?`).run(this._id);
  };

  Club.prototype.populate = function (field: string) {
    if (field === 'members') populateMembers(this);
    if (field === 'owner') populateOwner(this);
    return this;
  };

  Club.find = function (conditions: any = {}) {
    const db = getDb();
    if (conditions.members) {
      const userId = conditions.members;
      const clubRows = db.prepare(
        `SELECT c.* FROM ${table} c JOIN ${memberTable} cm ON cm.clubId = c._id WHERE cm.userId = ?`
      ).all(userId);
      return {
        populate: function () { return this; },
        sort: function () { return this; },
        skip: function () { return this; },
        limit: function (n: number) {
          return clubRows.slice(0, n).map(rowToClub).map(loadMembers);
        },
        exec: function () {
          return clubRows.map(rowToClub).map(loadMembers);
        },
        then: function (resolve: any, reject?: any) {
          return Promise.resolve(clubRows.map(rowToClub).map(loadMembers)).then(resolve, reject);
        },
      };
    }
    let sql = `SELECT * FROM ${table}`;
    const where: string[] = [];
    const params: any[] = [];
    if (conditions.isPublic !== undefined) {
      where.push('isPublic = ?');
      params.push(conditions.isPublic ? 1 : 0);
    }
    if (where.length > 0) sql += ` WHERE ${where.join(' AND ')}`;
    sql += ' ORDER BY createdAt DESC';

    const rows = db.prepare(sql).all(...params);
    return {
      populate: function () { return this; },
      sort: function () { return this; },
      skip: function (n: number) {
        const sliced = rows.slice(n);
        return {
          limit: (lim: number) => sliced.slice(0, lim).map(rowToClub).map(loadMembers),
        };
      },
      limit: function (n: number) {
        return rows.slice(0, n).map(rowToClub).map(loadMembers);
      },
      exec: function () {
        return rows.map(rowToClub).map(loadMembers);
      },
      then: function (resolve: any, reject?: any) {
        return Promise.resolve(rows.map(rowToClub).map(loadMembers)).then(resolve, reject);
      },
    };
  };

  Club.findOne = function (conditions: any) {
    const row = sqliteFindOne(table, conditions);
    if (!row) return null;
    return wrapDoc(rowToClub(row));
  };

  Club.findById = function (id: string) {
    const row = sqliteFindOne(table, { _id: id });
    if (!row) return null;
    return wrapDoc(loadMembers(rowToClub(row)));
  };

  Club.findOneAndDelete = function (conditions: any) {
    const doc = Club.findOne(conditions);
    if (doc) doc.deleteOne();
    return doc;
  };

  Club.countDocuments = function (conditions: any = {}) {
    return sqliteCount(table, conditions);
  };

  Club.create = function (data: any) {
    const club = new Club(data);
    club.save();
    return rowToClub({ _id: club._id, name: club.name, description: club.description, isPublic: club.isPublic ? 1 : 0, owner: club.owner, createdAt: club.createdAt, updatedAt: club.updatedAt });
  };
}
