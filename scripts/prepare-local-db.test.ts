import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createClient } from '@libsql/client';
import { prepareLocalDatabase } from '@/src/db/client';
import {
    resolveDatabaseConfig,
    resolveLocalDbPath,
} from '@/src/db/resolveDbUrl';

describe('prepare local SQLite database', () => {
    it('applies schema and migrations to DATABASE_URL from .env', async () => {
        const config = resolveDatabaseConfig();
        expect(config.url.startsWith('file:')).toBe(true);
        expect(config.url).not.toContain(':memory:');

        const dbPath = resolveLocalDbPath();
        expect(path.isAbsolute(dbPath)).toBe(true);

        await prepareLocalDatabase();

        const db = createClient({ url: config.url });
        try {
            const columns = await db.execute('PRAGMA table_info(preferences)');
            const names = columns.rows.map((row) =>
                String((row as { name: string }).name),
            );
            expect(names).toContain('accent_color');
        } finally {
            db.close();
        }
    });
});
