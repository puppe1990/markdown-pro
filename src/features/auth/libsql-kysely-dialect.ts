import type { Client } from '@libsql/client/web';
import {
    SqliteAdapter,
    SqliteIntrospector,
    SqliteQueryCompiler,
    type DatabaseConnection,
    type DatabaseIntrospector,
    type Driver,
    type Kysely,
    type QueryCompiler,
    type QueryResult,
    type Dialect,
    type DialectAdapter,
} from 'kysely';

/** Kysely dialect backed by @libsql/client/web (HTTP-only, safe on Netlify). */
export class LibsqlKyselyDialect implements Dialect {
    readonly #client: Client;
    readonly #ownsClient: boolean;

    constructor(client: Client, ownsClient = false) {
        this.#client = client;
        this.#ownsClient = ownsClient;
    }

    createAdapter(): DialectAdapter {
        return new SqliteAdapter();
    }

    createDriver(): Driver {
        return new LibsqlKyselyDriver(this.#client, this.#ownsClient);
    }

    createIntrospector(db: Kysely<unknown>): DatabaseIntrospector {
        return new SqliteIntrospector(db);
    }

    createQueryCompiler(): QueryCompiler {
        return new SqliteQueryCompiler();
    }
}

class LibsqlKyselyDriver implements Driver {
    readonly #client: Client;
    readonly #ownsClient: boolean;

    constructor(client: Client, ownsClient: boolean) {
        this.#client = client;
        this.#ownsClient = ownsClient;
    }

    async init(): Promise<void> {}

    async acquireConnection(): Promise<DatabaseConnection> {
        return new LibsqlKyselyConnection(this.#client);
    }

    async beginTransaction(connection: DatabaseConnection): Promise<void> {
        await (connection as LibsqlKyselyConnection).beginTransaction();
    }

    async commitTransaction(connection: DatabaseConnection): Promise<void> {
        await (connection as LibsqlKyselyConnection).commitTransaction();
    }

    async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
        await (connection as LibsqlKyselyConnection).rollbackTransaction();
    }

    async releaseConnection(): Promise<void> {}

    async destroy(): Promise<void> {
        if (this.#ownsClient) {
            this.#client.close();
        }
    }
}

class LibsqlKyselyConnection implements DatabaseConnection {
    readonly #client: Client;
    #transaction: Awaited<ReturnType<Client['transaction']>> | undefined;

    constructor(client: Client) {
        this.#client = client;
    }

    async executeQuery(compiledQuery: {
        sql: string;
        parameters: readonly unknown[];
    }): Promise<QueryResult<Record<string, unknown>>> {
        const target = this.#transaction ?? this.#client;
        const result = await target.execute({
            sql: compiledQuery.sql,
            args: [...compiledQuery.parameters],
        });

        return {
            insertId: result.lastInsertRowid,
            numAffectedRows: BigInt(result.rowsAffected),
            rows: result.rows as Record<string, unknown>[],
        };
    }

    async beginTransaction(): Promise<void> {
        if (this.#transaction) {
            throw new Error('Transaction already in progress');
        }
        this.#transaction = await this.#client.transaction();
    }

    async commitTransaction(): Promise<void> {
        if (!this.#transaction) {
            throw new Error('No transaction to commit');
        }
        await this.#transaction.commit();
        this.#transaction = undefined;
    }

    async rollbackTransaction(): Promise<void> {
        if (!this.#transaction) {
            throw new Error('No transaction to rollback');
        }
        await this.#transaction.rollback();
        this.#transaction = undefined;
    }
}
