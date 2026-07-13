import {
  sqliteQuery, sqliteFindOne, sqliteCount, sqliteInsert, sqliteUpdate, sqliteDelete, generateId, getDb,
} from './sqlite-init';

interface IndexDef {
  fields: string[];
  unique?: boolean;
}

interface ModelOptions {
  table: string;
  timestamps?: boolean;
  indexes?: IndexDef[];
}

export class Model<T extends Record<string, any>> {
  private table: string;
  private timestamps: boolean;

  constructor(private name: string, private schema: any, private options: ModelOptions) {
    this.table = options.table;
    this.timestamps = options.timestamps ?? false;
  }

  private rowToDoc(row: any): T {
    if (!row) return row;
    const doc = { ...row } as any;
    doc._id = String(row._id);
    if (row.isPublic !== undefined) doc.isPublic = Boolean(row.isPublic);
    if (row.hasPdf !== undefined) doc.hasPdf = Boolean(row.hasPdf);
    return doc as T;
  }

  find(conditions: Record<string, any> = {}): QueryBuilder<T> {
    return new QueryBuilder<T>(this.table, conditions);
  }

  findOne(conditions: Record<string, any>): T | null {
    const row = sqliteFindOne(this.table, conditions);
    return this.rowToDoc(row) as T | null;
  }

  findById(id: string): (T & { save: () => void; deleteOne: () => void }) | null {
    const row = sqliteFindOne(this.table, { _id: id });
    if (!row) return null;
    return this.wrapDoc(this.rowToDoc(row) as T);
  }

  findOneAndDelete(conditions: Record<string, any>): T | null {
    const doc = this.findOne(conditions);
    if (doc) sqliteDelete(this.table, conditions);
    return doc;
  }

  findOneAndUpdate(conditions: Record<string, any>, update: Record<string, any>): T | null {
    const doc = this.findOne(conditions);
    if (!doc) return null;
    const data = { ...update };
    if (this.timestamps) data.updatedAt = new Date().toISOString();
    const id = (doc as any)._id;
    sqliteUpdate(this.table, id, data);
    return { ...doc, ...data } as T;
  }

  countDocuments(conditions: Record<string, any> = {}): number {
    return sqliteCount(this.table, conditions);
  }

  create(data: Partial<T>): T {
    const doc = { _id: generateId(), ...data } as any;
    if (this.timestamps) {
      const now = new Date().toISOString();
      doc.createdAt = now;
      doc.updatedAt = now;
    }
    sqliteInsert(this.table, doc);
    return this.rowToDoc(doc) as T;
  }

  private wrapDoc(doc: T) {
    const self = this;
    const wrapped: any = { ...doc };
    wrapped._isNew = false;
    wrapped.save = function () {
      const data: any = {};
      for (const key of Object.keys(this)) {
        if (key.startsWith('_')) continue;
        data[key] = this[key];
      }
      if (self.timestamps) data.updatedAt = new Date().toISOString();
      sqliteUpdate(self.table, this._id, data);
    };
    wrapped.deleteOne = function () {
      sqliteDelete(self.table, { _id: this._id });
    };
    wrapped.populate = function () {
      return this;
    };
    return wrapped;
  }

  build(doc: T) {
    return this.wrapDoc(doc);
  }
}

class QueryBuilder<T> {
  private conditions: Record<string, any>;
  private sortOpts: Record<string, -1 | 1> = {};
  private limitVal?: number;
  private skipVal?: number;

  constructor(private table: string, conditions: Record<string, any>) {
    this.conditions = conditions;
  }

  sort(sortObj: Record<string, -1 | 1>) {
    this.sortOpts = sortObj;
    return this;
  }

  limit(n: number) {
    this.limitVal = n;
    return this;
  }

  skip(n: number) {
    this.skipVal = n;
    return this;
  }

  private rowToDoc(row: any): T {
    if (!row) return row;
    if (row.isPublic !== undefined) row.isPublic = Boolean(row.isPublic);
    if (row.hasPdf !== undefined) row.hasPdf = Boolean(row.hasPdf);
    return row as T;
  }

  exec(): T[] {
    const rows = sqliteQuery(this.table, this.conditions, {
      sort: this.sortOpts,
      limit: this.limitVal,
      skip: this.skipVal,
    });
    return rows.map((r) => this.rowToDoc(r));
  }

  then(resolve: (value: T[]) => any, reject?: (reason: any) => any) {
    return Promise.resolve(this.exec()).then(resolve, reject);
  }

  populate() {
    return this;
  }
}
