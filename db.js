import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("./data.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      name TEXT,
      slug TEXT UNIQUE,
      created_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      app_id TEXT,
      role TEXT,
      message TEXT,
      created_at TEXT
    )
  `);
});
