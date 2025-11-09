import { db, saveDatabase } from './init.js';

// Helper to insert and get the last inserted ID
export function insertAndGetId(sql, params = []) {
  db.run(sql, params);
  const result = db.exec('SELECT last_insert_rowid() as id');
  saveDatabase();
  return result[0].values[0][0];
}

// Helper to run a query and return all results as objects
export function query(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);

  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();

  return results;
}

// Helper to run a query and return a single result
export function queryOne(sql, params = []) {
  const results = query(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Helper to execute a statement without returning results
export function execute(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
}

// Helper to execute multiple statements
export function executeMany(statements) {
  statements.forEach(stmt => {
    if (Array.isArray(stmt)) {
      db.run(stmt[0], stmt.slice(1));
    } else {
      db.run(stmt);
    }
  });
  saveDatabase();
}
