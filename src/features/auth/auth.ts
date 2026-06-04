import { betterAuth } from 'better-auth';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import {
    resolveAuthBaseUrl,
    resolveDatabaseConfig,
} from '@/src/db/resolveDbUrl';
import { LibsqlHranaDialect } from '@/src/db/libsql-client-dialect';

function createAuthDatabase() {
    const config = resolveDatabaseConfig();

    return {
        dialect: new LibsqlHranaDialect({
            url: config.url,
            authToken: config.authToken,
        }),
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
