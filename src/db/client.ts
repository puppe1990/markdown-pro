import { createClient, type Client } from '@libsql/client';
import { migrateAppSchema } from './migrate';
import { resolveDatabaseConfig } from './resolveDbUrl';

let dbInstance: Client | null = null;
let initPromise: Promise<Client> | null = null;

async function initializeDb(): Promise<Client> {
    const config = resolveDatabaseConfig();
    const db = createClient(
        config.authToken
            ? { url: config.url, authToken: config.authToken }
            : { url: config.url },
    );
    await migrateAppSchema(db);
    dbInstance = db;
    return db;
}

export async function getDbReady(): Promise<Client> {
    if (dbInstance) return dbInstance;
    if (!initPromise) initPromise = initializeDb();
    return initPromise;
}

export function getDb(): Client {
    if (!dbInstance) {
        throw new Error(
            'Database not ready. Call getDbReady() before getDb() in server handlers.',
        );
    }
    return dbInstance;
}
