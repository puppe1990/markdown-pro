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

const THEME_SYSTEM_MIGRATION_ID = 'preferences-theme-system';

async function migratePreferencesThemeSystem(db: Client): Promise<void> {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS app_migrations (
            id TEXT PRIMARY KEY,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);

    const applied = await db.execute({
        sql: 'SELECT id FROM app_migrations WHERE id = ?',
        args: [THEME_SYSTEM_MIGRATION_ID],
    });
    if (applied.rows.length > 0) {
        return;
    }

    const tableRow = await db.execute({
        sql: "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'preferences'",
    });
    const createSql = String(
        (tableRow.rows[0] as { sql?: string } | undefined)?.sql ?? '',
    );
    if (createSql.includes("'system'")) {
        await db.execute({
            sql: 'INSERT INTO app_migrations (id) VALUES (?)',
            args: [THEME_SYSTEM_MIGRATION_ID],
        });
        return;
    }

    await db.execute(`
        CREATE TABLE preferences_theme_system (
            user_id    TEXT PRIMARY KEY,
            theme      TEXT NOT NULL DEFAULT 'system'
                CHECK(theme IN ('light', 'dark', 'system')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);
    await db.execute(`
        INSERT INTO preferences_theme_system (user_id, theme, updated_at)
        SELECT user_id, theme, updated_at FROM preferences
    `);
    await db.execute('DROP TABLE preferences');
    await db.execute(
        'ALTER TABLE preferences_theme_system RENAME TO preferences',
    );
    await db.execute({
        sql: 'INSERT INTO app_migrations (id) VALUES (?)',
        args: [THEME_SYSTEM_MIGRATION_ID],
    });
}

/** Runs incremental migrations (safe to call on every DB access). */
export async function runPendingMigrations(db: Client): Promise<void> {
    if (isRemoteDatabase(resolveDatabaseConfig())) {
        return;
    }

    await migratePreferencesThemeSystem(db);
    await migratePreferencesAccentColor(db);
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

    await runPendingMigrations(db);
}

const ACCENT_COLOR_MIGRATION_ID = 'preferences-accent-color';

async function migratePreferencesAccentColor(db: Client): Promise<void> {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS app_migrations (
            id TEXT PRIMARY KEY,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);

    const applied = await db.execute({
        sql: 'SELECT id FROM app_migrations WHERE id = ?',
        args: [ACCENT_COLOR_MIGRATION_ID],
    });
    if (applied.rows.length > 0) {
        return;
    }

    const columns = await db.execute('PRAGMA table_info(preferences)');
    const hasAccentColumn = columns.rows.some(
        (row) => String((row as { name: string }).name) === 'accent_color',
    );
    if (!hasAccentColumn) {
        await db.execute(`
            ALTER TABLE preferences
            ADD COLUMN accent_color TEXT NOT NULL DEFAULT 'teal'
        `);
    }

    await db.execute({
        sql: 'INSERT INTO app_migrations (id) VALUES (?)',
        args: [ACCENT_COLOR_MIGRATION_ID],
    });
}
