const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

export let Notification: any;

if (DB_TYPE === 'mongodb') {
  const mongoose: any = require('mongoose');
  const Schema = mongoose.Schema;

  const notifSchema = new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
      type: { type: String, required: true },
      message: { type: String, required: true },
      relatedClubId: { type: String },
      isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
  );

  Notification = mongoose.model('Notification', notifSchema);
} else {
  const { getDb, generateId, sqliteQuery, sqliteFindOne, sqliteInsert, sqliteUpdate, sqliteDelete, sqliteCount } = require('../db/sqlite-init');

  const table = 'notifications';

  function rowToNotif(row: any) {
    if (!row) return null;
    return {
      ...row,
      _id: String(row._id),
      isRead: Boolean(row.isRead),
    };
  }

  Notification = function (this: any, data: any) {
    this._id = generateId();
    this._isNew = true;
    this.userId = data.userId;
    this.type = data.type;
    this.message = data.message;
    this.relatedClubId = data.relatedClubId || null;
    this.isRead = data.isRead !== undefined ? data.isRead : false;
    this.createdAt = data.createdAt || new Date().toISOString();
  } as any;

  Notification.prototype.save = function () {
    const data: any = {};
    for (const key of Object.keys(this)) {
      if (key.startsWith('_')) continue;
      data[key] = this[key];
    }
    if (this._isNew) {
      data._id = this._id;
      sqliteInsert(table, data);
      this._isNew = false;
    } else {
      sqliteUpdate(table, this._id, data);
    }
  };

  Notification.find = function (conditions: any = {}) {
    const results = sqliteQuery(table, conditions, { sort: { createdAt: -1 } });
    return results.map(rowToNotif);
  };

  Notification.findOne = function (conditions: any) {
    const row = sqliteFindOne(table, conditions);
    return rowToNotif(row);
  };

  Notification.findById = function (id: string) {
    return Notification.findOne({ _id: id });
  };

  Notification.countDocuments = function (conditions: any = {}) {
    return sqliteCount(table, conditions);
  };

  Notification.create = function (data: any) {
    const notif = new Notification(data);
    notif.save();
    return rowToNotif({ _id: notif._id, userId: notif.userId, type: notif.type, message: notif.message, relatedClubId: notif.relatedClubId, isRead: notif.isRead ? 1 : 0, createdAt: notif.createdAt });
  };
}
