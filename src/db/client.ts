import { openHttp, type HttpStream } from '@libsql/hrana-client';
import { migrateAppSchema } from './migrate';
import { resolveDatabaseConfig } from './resolveDbUrl';

let streamInstance: HttpStream | null = null;
let initPromise: Promise<void> | null = null;

async function initializeDb(): Promise<void> {
    const config = resolveDatabaseConfig();
    const client = openHttp(new URL(config.url), config.authToken);
    const stream = client.openStream();
    await migrateAppSchema(stream);
    streamInstance = stream;
}

export async function getDbReady(): Promise<HttpStream> {
    if (streamInstance) return streamInstance;
    if (!initPromise) initPromise = initializeDb();
    await initPromise;
    return streamInstance!;
}

export function getDb(): HttpStream {
    if (!streamInstance) {
        throw new Error(
            'Database not ready. Call getDbReady() before getDb() in server handlers.',
        );
    }
    return streamInstance;
}
