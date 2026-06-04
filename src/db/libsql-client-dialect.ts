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
import {
    openHttp,
    type HttpClient,
    type HttpStream,
} from '@libsql/hrana-client';

export interface LibsqlHranaDialectConfig {
    url: string;
    authToken?: string;
}

export class LibsqlHranaDialect implements Dialect {
    private config: LibsqlHranaDialectConfig;

    constructor(config: LibsqlHranaDialectConfig) {
        this.config = config;
    }

    createAdapter(): DialectAdapter {
        return new SqliteAdapter();
    }

    createDriver(): Driver {
        return new LibsqlHranaDriver(this.config);
    }

    createIntrospector(db: unknown): unknown {
        return new SqliteIntrospector(db as never);
    }

    createQueryCompiler(): QueryCompiler {
        return new SqliteQueryCompiler();
    }
}

class LibsqlHranaDriver implements Driver {
    private client: HttpClient;

    constructor(config: LibsqlHranaDialectConfig) {
        this.client = openHttp(new URL(config.url), config.authToken);
    }

    async init(): Promise<void> {}

    async acquireConnection(): Promise<DatabaseConnection> {
        const stream = this.client.openStream();
        return new LibsqlHranaConnection(stream);
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
        (conn as LibsqlHranaConnection).close();
    }

    async destroy(): Promise<void> {
        this.client.close();
    }
}

class LibsqlHranaConnection implements DatabaseConnection {
    private stream: HttpStream;

    constructor(stream: HttpStream) {
        this.stream = stream;
    }

    async executeQuery<R>(query: CompiledQuery): Promise<QueryResult<R>> {
        const result = await this.stream.run({
            sql: query.sql,
            args: query.parameters as unknown[],
        });

        return {
            insertId:
                result.lastInsertRowid !== undefined
                    ? BigInt(result.lastInsertRowid)
                    : undefined,
            numAffectedRows: BigInt(result.affectedRowCount),
            rows: [] as R[],
        };
    }

    async *streamQuery<R>(
        query: CompiledQuery,
        chunkSize: number,
    ): AsyncIterableIterator<QueryResult<R>> {
        void chunkSize;
        const rowsResult = await this.stream.query({
            sql: query.sql,
            args: query.parameters as unknown[],
        });

        yield {
            insertId: undefined,
            numAffectedRows: BigInt(rowsResult.rows.length),
            rows: rowsResult.rows as R[],
        };
    }

    close(): void {
        this.stream.close();
    }
}
