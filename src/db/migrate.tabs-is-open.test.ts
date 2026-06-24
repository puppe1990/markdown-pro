import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createClient, type Client } from '@libsql/client';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runPendingMigrations } from './migrate';

vi.mock('@/src/db/resolveDbUrl', () => ({
    resolveDatabaseConfig: vi.fn(() => ({
        url: 'file:local-test.db',
        authToken: undefined,
    })),
}));

describe('runPendingMigrations tabs is_open', () => {
    let dbPath: string;
    let db: Client;

    beforeEach(async () => {
        dbPath = path.join(
            os.tmpdir(),
            `markdown-pro-tabs-is-open-${Date.now()}.sqlite`,
        );
        db = createClient({ url: `file:${dbPath}` });
        await db.execute(`
            CREATE TABLE tabs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL DEFAULT 'Untitled',
                content TEXT NOT NULL DEFAULT '',
                position INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        `);
        await db.execute(`
            CREATE TABLE preferences (
                user_id TEXT PRIMARY KEY,
                theme TEXT NOT NULL DEFAULT 'system',
                accent_color TEXT NOT NULL DEFAULT 'teal',
                updated_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
        `);
    });

    afterEach(async () => {
        await db.close();
        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath);
        }
    });

    it('adds is_open column to legacy tabs table with default 1', async () => {
        await db.execute(
            `INSERT INTO tabs (id, user_id, name, content, position)
             VALUES ('tab-1', 'user-1', 'Note', '# Hello', 0)`,
        );

        await runPendingMigrations(db);

        const columns = await db.execute('PRAGMA table_info(tabs)');
        const names = columns.rows.map((row) =>
            String((row as { name: string }).name),
        );
        expect(names).toContain('is_open');

        const row = await db.execute('SELECT is_open FROM tabs WHERE id = ?', [
            'tab-1',
        ]);
        expect((row.rows[0] as { is_open: number }).is_open).toBe(1);
    });

    it('is idempotent when is_open already exists', async () => {
        await runPendingMigrations(db);
        await expect(runPendingMigrations(db)).resolves.not.toThrow();
    });
});
