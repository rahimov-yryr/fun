import { getDatabase, saveDatabase } from './init.js';

// Database wrapper that mimics better-sqlite3 API for sql.js
class DatabaseWrapper {
  constructor() {
    this.db = null;
  }

  async ensureDb() {
    if (!this.db) {
      this.db = await getDatabase();
    }
    return this.db;
  }

  // Prepare a statement (returns an object with get, all, run methods)
  prepare(sql) {
    const self = this;

    return {
      // Get single row
      get(...params) {
        const db = self.db;
        if (!db) return null;

        const stmt = db.prepare(sql);
        stmt.bind(params);

        let result = null;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();

        return result;
      },

      // Get all rows
      all(...params) {
        const db = self.db;
        if (!db) return [];

        const stmt = db.prepare(sql);
        stmt.bind(params);

        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();

        return results;
      },

      // Run statement (insert, update, delete)
      run(...params) {
        const db = self.db;
        if (!db) return { changes: 0, lastInsertRowid: 0 };

        db.run(sql, params);

        // Get last insert ID
        const result = db.exec('SELECT last_insert_rowid() as id, changes() as changes');
        const lastInsertRowid = result[0]?.values[0]?.[0] || 0;
        const changes = result[0]?.values[0]?.[1] || 0;

        saveDatabase();

        return {
          changes: changes,
          lastInsertRowid: lastInsertRowid
        };
      }
    };
  }

  // Execute SQL directly
  exec(sql) {
    if (!this.db) return;
    this.db.run(sql);
    saveDatabase();
  }

  // Run with pragma
  pragma(command) {
    if (!this.db) return;
    this.db.run(`PRAGMA ${command}`);
  }
}

// Create singleton instance
const dbWrapper = new DatabaseWrapper();

// Initialize the wrapper
export async function initWrapper() {
  await dbWrapper.ensureDb();
}

export default dbWrapper;
