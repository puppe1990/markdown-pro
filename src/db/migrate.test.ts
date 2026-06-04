import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Client } from '@libsql/client';

vi.mock('@/src/db/resolveDbUrl', () => ({
    resolveDatabaseConfig: vi.fn(),
}));

import { resolveDatabaseConfig } from '@/src/db/resolveDbUrl';
import { migrateAppSchema } from '@/src/db/migrate';

describe('migrateAppSchema', () => {
    const execute = vi.fn();
    const db = { execute } as unknown as Client;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('skips file migration for remote Turso URLs', async () => {
        vi.mocked(resolveDatabaseConfig).mockReturnValue({
            url: 'libsql://markdown-pro-puppe1990.aws-us-east-1.turso.io',
            authToken: 'token',
        });

        await migrateAppSchema(db);

        expect(execute).not.toHaveBeenCalled();
    });
});
