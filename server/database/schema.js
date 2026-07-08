const { executeTransaction } = require("../db");

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL UNIQUE,
    fullname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin'))
  )
`;

const createItemsTable = `
  CREATE TABLE IF NOT EXISTS Items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    date_reported TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Lost', 'Found', 'Claimed')),
    image TEXT,
    reported_by INTEGER NOT NULL,
    FOREIGN KEY (reported_by) REFERENCES Users(user_id) ON DELETE CASCADE
  )
`;

const createClaimsTable = `
  CREATE TABLE IF NOT EXISTS Claims (
    claim_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    claimant_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    FOREIGN KEY (item_id) REFERENCES Items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (claimant_id) REFERENCES Users(user_id) ON DELETE CASCADE
  )
`;

const createNotificationsTable = `
  CREATE TABLE IF NOT EXISTS Notifications (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0, 1)),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
  )
`;

async function initializeDatabase() {
  await executeTransaction([
    { sql: createUsersTable },
    { sql: createItemsTable },
    { sql: createClaimsTable },
    { sql: createNotificationsTable },
  ]);
}

module.exports = {
  initializeDatabase,
};
