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

describe('runPendingMigrations accent_color', () => {
    let dbPath: string;
    let db: Client;

    beforeEach(async () => {
        dbPath = path.join(
            os.tmpdir(),
            `markdown-pro-accent-migrate-${Date.now()}.sqlite`,
        );
        db = createClient({ url: `file:${dbPath}` });
        await db.execute(`
            CREATE TABLE preferences (
                user_id TEXT PRIMARY KEY,
                theme TEXT NOT NULL DEFAULT 'light',
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

    it('adds accent_color column to legacy preferences table', async () => {
        await runPendingMigrations(db);

        const columns = await db.execute('PRAGMA table_info(preferences)');
        const names = columns.rows.map((row) =>
            String((row as { name: string }).name),
        );
        expect(names).toContain('accent_color');

        await db.execute(
            `INSERT INTO preferences (user_id, theme, accent_color)
             VALUES ('user-1', 'light', 'rose')`,
        );
        const row = await db.execute(
            'SELECT accent_color FROM preferences WHERE user_id = ?',
            ['user-1'],
        );
        expect((row.rows[0] as { accent_color: string }).accent_color).toBe(
            'rose',
        );
    });
});
