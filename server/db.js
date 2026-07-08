const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const databaseDirectory = path.join(__dirname, "database");
const databasePath = path.join(databaseDirectory, "campusfind.sqlite");

fs.mkdirSync(databaseDirectory, { recursive: true });

const db = new sqlite3.Database(databasePath, (error) => {
  if (error) {
    console.error("Failed to connect to SQLite database:", error.message);
    return;
  }

  console.log(`SQLite database connected at ${databasePath}`);
});

db.run("PRAGMA foreign_keys = ON");

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function handleResult(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

async function executeTransaction(queries) {
  await run("BEGIN TRANSACTION");

  try {
    for (const query of queries) {
      await run(query.sql, query.params);
    }

    await run("COMMIT");
  } catch (error) {
    await run("ROLLBACK");
    throw error;
  }
}

async function testConnection() {
  const result = await get("SELECT 1 AS connected");
  return result?.connected === 1;
}

function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

module.exports = {
  db,
  databasePath,
  run,
  get,
  all,
  executeTransaction,
  testConnection,
  closeDatabase,
};
