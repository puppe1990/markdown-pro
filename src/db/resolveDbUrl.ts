import fs from 'node:fs';
import path from 'node:path';

export interface DatabaseConfig {
    url: string;
    authToken?: string;
}

function isServerlessRuntime(): boolean {
    return (
        process.env.NETLIFY === 'true' ||
        process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined
    );
}

function defaultLocalDbPath(): string {
    if (isServerlessRuntime()) {
        return '/tmp/markdown-pro.sqlite';
    }

    return path.resolve(process.cwd(), 'data/markdown-pro.sqlite');
}

function isLocalDatabaseUrl(url: string): boolean {
    return (
        url.startsWith('file:') ||
        url === ':memory:' ||
        (!url.includes('://') && !url.startsWith('libsql:'))
    );
}

/**
 * Resolves relative SQLite paths to an absolute file: URL and ensures the parent dir exists.
 * Example: normalizeLocalDatabaseUrl('file:./data/app.sqlite') // file:/abs/path/data/app.sqlite
 */
export function normalizeLocalDatabaseUrl(url: string): string {
    if (url === ':memory:' || url.startsWith('file::memory:')) {
        return url.startsWith('file:') ? url : 'file::memory:';
    }

    const rawPath = url.startsWith('file:') ? url.slice('file:'.length) : url;
    const absolutePath = path.isAbsolute(rawPath)
        ? rawPath
        : path.resolve(process.cwd(), rawPath);

    if (!isServerlessRuntime()) {
        fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    }

    return `file:${absolutePath}`;
}

export function resolveLocalDbPath(): string {
    const config = resolveDatabaseConfig();
    if (!config.url.startsWith('file:')) {
        throw new Error(`Expected local SQLite file URL, got "${config.url}"`);
    }
    return config.url.slice('file:'.length);
}

export function resolveDatabaseConfig(): DatabaseConfig {
    const databaseUrl = process.env.DATABASE_URL?.trim();

    // Explicit local DATABASE_URL wins over Turso so dev can keep both in .env.
    if (databaseUrl && isLocalDatabaseUrl(databaseUrl)) {
        const url = databaseUrl.startsWith('file:')
            ? databaseUrl
            : `file:${databaseUrl}`;
        return { url: normalizeLocalDatabaseUrl(url) };
    }

    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (tursoUrl?.startsWith('libsql://') && tursoToken) {
        return { url: tursoUrl, authToken: tursoToken };
    }

    const localDbPath = defaultLocalDbPath();
    if (!isServerlessRuntime()) {
        fs.mkdirSync(path.dirname(localDbPath), { recursive: true });
    }

    return { url: `file:${localDbPath}` };
}

export function resolveAuthBaseUrl(): string {
    return (
        process.env.BETTER_AUTH_URL ??
        process.env.DEPLOY_PRIME_URL ??
        process.env.URL ??
        'http://localhost:3000'
    );
}

export function isLocalSqliteConfig(config: DatabaseConfig): boolean {
    return config.url.startsWith('file:') && !config.url.includes(':memory:');
}
