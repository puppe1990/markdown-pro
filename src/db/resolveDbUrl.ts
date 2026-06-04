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

export function resolveLocalDbPath(): string {
    const config = resolveDatabaseConfig();
    if (!config.url.startsWith('file:')) {
        throw new Error(`Expected local SQLite file URL, got "${config.url}"`);
    }
    return config.url.replace(/^file:/, '');
}

export function resolveDatabaseConfig(): DatabaseConfig {
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (tursoUrl?.startsWith('libsql://') && tursoToken) {
        return { url: tursoUrl, authToken: tursoToken };
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
        return databaseUrl.startsWith('file:')
            ? { url: databaseUrl }
            : { url: `file:${databaseUrl}` };
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
