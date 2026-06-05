import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import path from 'node:path';
import {
    normalizeLocalDatabaseUrl,
    resolveDatabaseConfig,
} from './resolveDbUrl';

describe('normalizeLocalDatabaseUrl', () => {
    it('resolves relative file URLs to an absolute path', () => {
        const normalized = normalizeLocalDatabaseUrl(
            'file:./data/test-resolve.sqlite',
        );
        const expected = path.resolve(
            process.cwd(),
            'data/test-resolve.sqlite',
        );
        expect(normalized).toBe(`file:${expected}`);
    });

    it('preserves in-memory URLs', () => {
        expect(normalizeLocalDatabaseUrl('file::memory:')).toBe(
            'file::memory:',
        );
    });
});

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

    it('prefers local DATABASE_URL over Turso when both are set', () => {
        process.env.TURSO_DATABASE_URL = 'libsql://example.turso.io';
        process.env.TURSO_AUTH_TOKEN = 'secret-token';
        process.env.DATABASE_URL = 'file:./data/local-priority.sqlite';

        const config = resolveDatabaseConfig();
        expect(config.url).toMatch(/^file:/);
        expect(config.url).toContain('local-priority.sqlite');
        expect(config.authToken).toBeUndefined();
    });

    it('normalizes local DATABASE_URL to an absolute file path', () => {
        delete process.env.TURSO_DATABASE_URL;
        delete process.env.TURSO_AUTH_TOKEN;
        process.env.DATABASE_URL = 'file:./data/test.sqlite';

        const config = resolveDatabaseConfig();
        const expected = path.resolve(process.cwd(), 'data/test.sqlite');
        expect(config).toEqual({ url: `file:${expected}` });
    });

    it('defaults to a local file when Turso is not configured', () => {
        delete process.env.TURSO_DATABASE_URL;
        delete process.env.TURSO_AUTH_TOKEN;
        delete process.env.DATABASE_URL;
        delete process.env.NETLIFY;
        delete process.env.AWS_LAMBDA_FUNCTION_NAME;

        const config = resolveDatabaseConfig();
        expect(config.url).toMatch(/^file:/);
        expect(config.authToken).toBeUndefined();
    });

    it('uses /tmp sqlite path on Netlify serverless runtime', () => {
        delete process.env.TURSO_DATABASE_URL;
        delete process.env.TURSO_AUTH_TOKEN;
        delete process.env.DATABASE_URL;
        process.env.NETLIFY = 'true';

        expect(resolveDatabaseConfig()).toEqual({
            url: 'file:/tmp/markdown-pro.sqlite',
        });
    });
});
