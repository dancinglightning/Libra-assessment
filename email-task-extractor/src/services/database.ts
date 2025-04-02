// services/database.ts
import sqlite3 from 'sqlite3';
import config from '../config';
import path from 'path';
import fs from 'fs';

// Define the directory where the database file should be stored
const dbDirectory = path.resolve(__dirname, '..', 'database');

// Create the directory if it does not exist
if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
}

// Resolve an absolute path for the database file in the src/database folder
const dbPath = path.resolve(dbDirectory, config.database.filename);
console.log('SQLite DB path:', dbPath);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    threadId TEXT,
    title TEXT,
    description TEXT,
    dueDate TEXT,
    priority TEXT,
    assignee TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS email_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    threadId TEXT,
    taskHash TEXT,
    processedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

export const saveTask = (task: any) => {
    const stmt = db.prepare(`INSERT INTO tasks (threadId, title, description, dueDate, priority, assignee) VALUES (?, ?, ?, ?, ?, ?)`);
    stmt.run(task.threadId, task.title, task.description, task.dueDate || null, task.priority, task.assignee || null);
    stmt.finalize();
};

export const saveEmailMetadata = (metadata: any) => {
    const stmt = db.prepare(`INSERT INTO email_metadata (threadId, taskHash) VALUES (?, ?)`);
    stmt.run(metadata.threadId, metadata.taskHash);
    stmt.finalize();
};

export const checkEmailProcessed = (threadId: string, taskHash: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT id FROM email_metadata WHERE threadId = ? AND taskHash = ?`, [threadId, taskHash], (err, row) => {
            if (err) return reject(err);
            resolve(!!row);
        });
    });
};
