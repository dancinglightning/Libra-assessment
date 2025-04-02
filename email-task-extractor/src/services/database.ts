import sqlite3 from 'sqlite3';
import config from '../config';

const db = new sqlite3.Database(config.database.filename);

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
