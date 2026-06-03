import fs from 'node:fs';
import path from 'node:path';

export interface DatabaseConfig {
    url: string;
    authToken?: string;
}

const defaultLocalDbPath = path.resolve(
    process.cwd(),
    'data/markdown-pro.sqlite',
);

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

    fs.mkdirSync(path.dirname(defaultLocalDbPath), { recursive: true });
    return { url: `file:${defaultLocalDbPath}` };
}
