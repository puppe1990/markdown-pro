import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resolveDatabaseConfig } from './resolveDbUrl';

describe('resolveDatabaseConfig', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('uses Turso when remote URL and token are set', () => {
        process.env.TURSO_DATABASE_URL = 'libsql://example.turso.io';
        process.env.TURSO_AUTH_TOKEN = 'secret-token';
        delete process.env.DATABASE_URL;

        expect(resolveDatabaseConfig()).toEqual({
            url: 'libsql://example.turso.io',
            authToken: 'secret-token',
        });
    });

    it('uses DATABASE_URL for local SQLite', () => {
        delete process.env.TURSO_DATABASE_URL;
        delete process.env.TURSO_AUTH_TOKEN;
        process.env.DATABASE_URL = 'file:./data/test.sqlite';

        expect(resolveDatabaseConfig()).toEqual({
            url: 'file:./data/test.sqlite',
        });
    });

    it('defaults to a local file when Turso is not configured', () => {
        delete process.env.TURSO_DATABASE_URL;
        delete process.env.TURSO_AUTH_TOKEN;
        delete process.env.DATABASE_URL;

        const config = resolveDatabaseConfig();
        expect(config.url).toMatch(/^file:/);
        expect(config.authToken).toBeUndefined();
    });
});
