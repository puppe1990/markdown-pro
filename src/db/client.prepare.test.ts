import { describe, expect, it } from 'vitest';
import { prepareLocalDatabase } from './client';
import { resolveDatabaseConfig } from './resolveDbUrl';

describe('prepareLocalDatabase', () => {
    it('runs against in-memory sqlite without throwing', async () => {
        const config = resolveDatabaseConfig();
        expect(config.url).toBe('file::memory:');

        await expect(prepareLocalDatabase()).rejects.toThrow(
            /expects a local file DATABASE_URL/,
        );
    });
});
