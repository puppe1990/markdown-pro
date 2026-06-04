import fs from 'node:fs';
import path from 'node:path';
import type { Client } from '@libsql/client';

const schemaPath = path.resolve(import.meta.dirname, 'schema.sql');

export async function migrateAppSchema(db: Client): Promise<void> {
    const sql = fs.readFileSync(schemaPath, 'utf-8');
    const statements = sql
        .split(';')
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0);

    for (const statement of statements) {
        await db.execute(statement);
    }
}
