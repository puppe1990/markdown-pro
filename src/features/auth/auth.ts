import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import {
    resolveAuthBaseUrl,
    resolveDatabaseConfig,
} from '@/src/db/resolveDbUrl';
import { LibsqlClientDialect } from '@/src/db/libsql-client-dialect';
import { createClient } from '@libsql/client';

function createAuthDatabase() {
    const config = resolveDatabaseConfig();
    const client = createClient(
        config.authToken
            ? { url: config.url, authToken: config.authToken }
            : { url: config.url },
    );

    return {
        dialect: new LibsqlClientDialect({ client }),
        type: 'sqlite' as const,
    };
}

const authBaseUrl = resolveAuthBaseUrl();

export const auth = betterAuth({
    database: createAuthDatabase(),
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
