import { Model } from '../db/Model';
import { sqliteInsert, sqliteUpdate, sqliteDelete } from '../db/sqlite-init';

export function createSQLiteAdapter<T extends Record<string, any>>(name: string, schema: any, options: { table: string; timestamps?: boolean }) {
  const model = new Model<T>(name, schema, options);

  const Constructor = function (this: any, data: Record<string, any>) {
    const now = new Date().toISOString();
    this._id = require('../db/sqlite-init').generateId();
    this._isNew = true;
    this._table = options.table;
    for (const [k, v] of Object.entries(data || {})) {
      this[k] = v;
    }
    if (options.timestamps) {
      this.createdAt = now;
      this.updatedAt = now;
    }
  } as any;

  Constructor.prototype.save = function () {
    const data: any = {};
    for (const key of Object.keys(this)) {
      if (key.startsWith('_')) continue;
      if (typeof this[key] === 'function') continue;
      data[key] = this[key];
    }
    if (options.timestamps) data.updatedAt = new Date().toISOString();
    if (this._isNew) {
      data._id = this._id;
      if (options.timestamps && !data.createdAt) data.createdAt = new Date().toISOString();
      sqliteInsert(options.table, data);
      this._isNew = false;
    } else {
      sqliteUpdate(options.table, this._id, data);
    }
  };

  Constructor.prototype.deleteOne = function () {
    sqliteDelete(options.table, { _id: this._id });
  };

  Constructor.prototype.populate = function () {
    return this;
  };

  Constructor.find = (conditions: Record<string, any> = {}) => model.find(conditions);
  Constructor.findOne = (conditions: Record<string, any>) => {
    const row = model.findOne(conditions);
    if (!row) return null;
    return wrapDoc(row, options.table, options.timestamps);
  };
  Constructor.findById = (id: string) => {
    const row = model.findById(id);
    if (!row) return null;
    return row;
  };

  Constructor.findOneAndDelete = (conditions: Record<string, any>) => {
    return model.findOneAndDelete(conditions);
  };

  Constructor.findOneAndUpdate = (conditions: Record<string, any>, update: Record<string, any>) => {
    return model.findOneAndUpdate(conditions, update);
  };

  Constructor.countDocuments = (conditions: Record<string, any> = {}) => model.countDocuments(conditions);
  Constructor.create = (data: Partial<T>) => model.create(data);

  return Constructor;
}

function wrapDoc(row: any, table: string, timestamps?: boolean) {
  const doc = { ...row };
  doc._isNew = false;
  doc._table = table;
  doc.save = function () {
    const data: any = {};
    for (const key of Object.keys(this)) {
      if (key.startsWith('_')) continue;
      if (typeof this[key] === 'function') continue;
      data[key] = this[key];
    }
    if (timestamps) data.updatedAt = new Date().toISOString();
    sqliteUpdate(table, this._id, data);
  };
  doc.deleteOne = function () {
    sqliteDelete(table, { _id: this._id });
  };
  doc.populate = function () {
    return this;
  };
  return doc;
}
