import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { resolveLocalDbPath } from './resolveDbUrl';

const dbPath = resolveLocalDbPath();
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const authDb = new Database(dbPath);
