import { createClient } from '@libsql/client';

let dbInstance: ReturnType<typeof createClient> | null = null;

export function getDb() {
    if (dbInstance) return dbInstance;

    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        throw new Error(
            'TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in environment variables',
        );
    }

    dbInstance = createClient({ url, authToken });
    return dbInstance;
}
