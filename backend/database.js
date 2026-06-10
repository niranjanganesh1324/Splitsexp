const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'splitsexp.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to SQLite database at:", dbPath);
  }
});

// Initialize database schema
db.serialize(() => {
  // Enable foreign key support in SQLite
  db.run("PRAGMA foreign_keys = ON");

  // Create Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    )
  `);

  // Create Groups Table
  db.run(`
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY (createdBy) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create Group Members Table (stores all members in groups, including friends without accounts)
  db.run(`
    CREATE TABLE IF NOT EXISTS group_members (
      groupId TEXT NOT NULL,
      memberId TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      PRIMARY KEY (groupId, memberId),
      FOREIGN KEY (groupId) REFERENCES groups (id) ON DELETE CASCADE
    )
  `);

  // Create Expenses Table
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      paidBy TEXT NOT NULL,
      groupName TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (paidBy) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create Expense Participants Table (stores split shares for each participant)
  db.run(`
    CREATE TABLE IF NOT EXISTS expense_participants (
      expenseId TEXT NOT NULL,
      participantId TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      PRIMARY KEY (expenseId, participantId),
      FOREIGN KEY (expenseId) REFERENCES expenses (id) ON DELETE CASCADE
    )
  `);
});

// Promise-based helpers for cleaner async/await database operations
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll
};
