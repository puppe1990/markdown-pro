import type { Client } from '@libsql/client';
import type { DatabaseConfig } from '@/src/db/resolveDbUrl';

function isRemoteLibsqlUrl(url: string): boolean {
    return (
        url.startsWith('libsql://') ||
        url.startsWith('https://') ||
        url.startsWith('http://')
    );
}

/**
 * Creates a libSQL client for the current runtime.
 * Remote Turso URLs use the HTTP-only web driver (Netlify-safe).
 *
 * @example
 * const db = await createLibsqlClient(resolveDatabaseConfig());
 */
export async function createLibsqlClient(
    config: DatabaseConfig,
): Promise<Client> {
    if (isRemoteLibsqlUrl(config.url)) {
        const { createClient } = await import('@libsql/client/web');
        return createClient(
            config.authToken
                ? { url: config.url, authToken: config.authToken }
                : { url: config.url },
        );
    }

    const { createClient } = await import('@libsql/client');
    return createClient(
        config.authToken
            ? { url: config.url, authToken: config.authToken }
            : { url: config.url },
    );
}
