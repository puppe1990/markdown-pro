import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { getDbReady } from '@/src/db/client';
import { resolveAuthBaseUrl } from '@/src/db/resolveDbUrl';
import { LibsqlKyselyDialect } from '@/src/features/auth/libsql-kysely-dialect';

const authBaseUrl = resolveAuthBaseUrl();

async function createAuthDatabase() {
    const client = await getDbReady();

    return {
        dialect: new LibsqlKyselyDialect(client, true),
        type: 'sqlite' as const,
    };
}

let authPromise: ReturnType<typeof createAuthInstance> | null = null;

async function createAuthInstance() {
    const database = await createAuthDatabase();

    return betterAuth({
        database,
        baseURL: authBaseUrl,
        basePath: '/api/auth',
        secret: process.env.BETTER_AUTH_SECRET,
        emailAndPassword: {
            enabled: true,
            autoSignIn: true,
        },
        trustedOrigins: [authBaseUrl],
        plugins: [tanstackStartCookies()],
    });
}

/** Lazy auth instance so Turso uses the HTTP-only libSQL client on serverless. */
export async function getAuth() {
    if (!authPromise) {
        authPromise = createAuthInstance();
    }
    return authPromise;
}
