import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { LibsqlDialect } from '@libsql/kysely-libsql';
import {
    resolveAuthBaseUrl,
    resolveDatabaseConfig,
} from '@/src/db/resolveDbUrl';

function createAuthDatabase() {
    const config = resolveDatabaseConfig();

    return {
        dialect: new LibsqlDialect(
            config.authToken
                ? { url: config.url, authToken: config.authToken }
                : { url: config.url },
        ),
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
