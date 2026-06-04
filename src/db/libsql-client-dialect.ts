import {
    type Dialect,
    type DialectAdapter,
    type Driver,
    type QueryResult,
    type DatabaseConnection,
    type QueryCompiler,
    type CompiledQuery,
    SqliteAdapter,
    SqliteIntrospector,
    SqliteQueryCompiler,
} from 'kysely';
import { type Client } from '@libsql/client';

export class LibsqlClientDialect implements Dialect {
    private config: LibsqlClientDialectConfig;

    constructor(config: LibsqlClientDialectConfig) {
        this.config = config;
    }

    createAdapter(): DialectAdapter {
        return new SqliteAdapter();
    }

    createDriver(): Driver {
        return new LibsqlClientDriver(this.config.client);
    }

    createIntrospector(db: unknown): unknown {
        return new SqliteIntrospector(db as never);
    }

    createQueryCompiler(): QueryCompiler {
        return new SqliteQueryCompiler();
    }
}

interface LibsqlClientDialectConfig {
    client: Client;
}

class LibsqlClientDriver implements Driver {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async init(): Promise<void> {}

    async acquireConnection(): Promise<DatabaseConnection> {
        return new LibsqlClientConnection(this.client);
    }

    async beginTransaction(conn: DatabaseConnection): Promise<void> {
        await conn.executeQuery(CompiledQuery.raw('BEGIN'));
    }

    async commitTransaction(conn: DatabaseConnection): Promise<void> {
        await conn.executeQuery(CompiledQuery.raw('COMMIT'));
    }

    async rollbackTransaction(conn: DatabaseConnection): Promise<void> {
        await conn.executeQuery(CompiledQuery.raw('ROLLBACK'));
    }

    async releaseConnection(conn: DatabaseConnection): Promise<void> {
        void conn;
    }

    async destroy(): Promise<void> {}
}

class LibsqlClientConnection implements DatabaseConnection {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async executeQuery<R>(query: CompiledQuery): Promise<QueryResult<R>> {
        const result = await this.client.execute({
            sql: query.sql,
            args: query.parameters as unknown[],
        });

        return {
            insertId: result.lastInsertRowid
                ? BigInt(result.lastInsertRowid)
                : undefined,
            numAffectedRows: BigInt(result.rowsAffected),
            rows: result.rows as R[],
        };
    }

    async *streamQuery<R>(
        query: CompiledQuery,
        chunkSize: number,
    ): AsyncIterableIterator<QueryResult<R>> {
        void chunkSize;
        const result = await this.executeQuery<R>(query);
        yield result;
    }
}
