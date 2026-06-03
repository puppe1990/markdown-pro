import { betterAuth } from 'better-auth';
import { getDb } from '@/src/db/client';

const db = getDb();

export const auth = betterAuth({
    database: {
        provider: 'sqlite',
        db,
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'],
});
