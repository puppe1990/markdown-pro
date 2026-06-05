import type { Client } from '@libsql/client';
import { createLibsqlClient } from './createLibsqlClient';
import { migrateAppSchema, runPendingMigrations } from './migrate';
import { resolveDatabaseConfig } from './resolveDbUrl';

let dbInstance: Client | null = null;
let initPromise: Promise<Client> | null = null;

async function initializeDb(): Promise<Client> {
    const config = resolveDatabaseConfig();
    const db = await createLibsqlClient(config);
    await migrateAppSchema(db);
    return db;
}

export async function getDbReady(): Promise<Client> {
    if (!dbInstance) {
        if (!initPromise) {
            initPromise = initializeDb().then((db) => {
                dbInstance = db;
                return db;
            });
        }
        await initPromise;
    }

    await runPendingMigrations(dbInstance);
    return dbInstance;
}

export function getDb(): Client {
    if (!dbInstance) {
        throw new Error(
            'Database not ready. Call getDbReady() before getDb() in server handlers.',
        );
    }
    return dbInstance;
}
