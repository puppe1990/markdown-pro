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
    parseLibsqlUrl,
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
    private client: ReturnType<typeof openHttp>;

    constructor(config: LibsqlHranaDialectConfig) {
        const parsed = parseLibsqlUrl(config.url);
        const httpUrl = parsed.hranaHttpUrl ?? config.url;
        const authToken = config.authToken ?? parsed.authToken;
        this.client = openHttp(new URL(httpUrl), authToken);
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
        const args = query.parameters as unknown[];
        const stmt = args.length > 0 ? [query.sql, args] : query.sql;
        const result = await this.stream.run(stmt);

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
    ): AsyncIterableIterator<QueryResult<R>> {
        const args = query.parameters as unknown[];
        const stmt = args.length > 0 ? [query.sql, args] : query.sql;
        const rowsResult = await this.stream.query(stmt);

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
