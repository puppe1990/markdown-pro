import type { Client } from '@libsql/client';
import { createLibsqlClient } from './createLibsqlClient';
import { migrateAppSchema, runPendingMigrations } from './migrate';
import { isLocalSqliteConfig, resolveDatabaseConfig } from './resolveDbUrl';

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

/**
 * Applies schema + migrations to the configured local SQLite file and closes the client.
 * Does not touch the app singleton — safe for CLI scripts that must exit.
 *
 * Example: await prepareLocalDatabase()
 */
export async function prepareLocalDatabase(): Promise<void> {
    const config = resolveDatabaseConfig();
    if (!isLocalSqliteConfig(config)) {
        throw new Error(
            `prepareLocalDatabase expects a local file DATABASE_URL, got "${config.url}". ` +
                `Set DATABASE_URL=file:./data/markdown-pro.sqlite in .env`,
        );
    }

    const db = await createLibsqlClient(config);
    try {
        await migrateAppSchema(db);
    } finally {
        db.close();
    }
}

/** Closes the singleton client (for tests or graceful shutdown). */
export function closeDatabase(): void {
    if (dbInstance && !dbInstance.closed) {
        dbInstance.close();
    }
    dbInstance = null;
    initPromise = null;
}
