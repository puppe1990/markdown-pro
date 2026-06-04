import fs from 'node:fs';
import path from 'node:path';
import type { Client } from '@libsql/client';
import {
    resolveDatabaseConfig,
    type DatabaseConfig,
} from '@/src/db/resolveDbUrl';

const schemaPath = path.resolve(import.meta.dirname, 'schema.sql');

/** Remote Turso DBs are migrated via CLI/CI; schema.sql is not bundled on Netlify. */
function isRemoteDatabase(config: DatabaseConfig): boolean {
    return (
        config.url.startsWith('libsql://') ||
        config.url.startsWith('https://') ||
        config.url.startsWith('http://')
    );
}

export async function migrateAppSchema(db: Client): Promise<void> {
    if (isRemoteDatabase(resolveDatabaseConfig())) {
        return;
    }

    const sql = fs.readFileSync(schemaPath, 'utf-8');
    const statements = sql
        .split(';')
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0);

    for (const statement of statements) {
        await db.execute(statement);
    }
}
