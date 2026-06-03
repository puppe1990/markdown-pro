import { betterAuth } from 'better-auth';
import { LibsqlDialect } from '@libsql/kysely-libsql';
import { authDb } from '@/src/db/authDb';
import { resolveDatabaseConfig } from '@/src/db/resolveDbUrl';

function createAuthDatabase() {
    const config = resolveDatabaseConfig();

    if (config.authToken) {
        return {
            dialect: new LibsqlDialect({
                url: config.url,
                authToken: config.authToken,
            }),
            type: 'sqlite' as const,
        };
    }

    return authDb;
}

export const auth = betterAuth({
    database: createAuthDatabase(),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'],
});
