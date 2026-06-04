import { createFileRoute } from '@tanstack/react-router';
import { getAuth } from '@/src/features/auth/auth';
import { getDbReady } from '@/src/db/client';

export const Route = createFileRoute('/api/auth/$')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                await getDbReady();
                const auth = await getAuth();
                return auth.handler(request);
            },
            POST: async ({ request }) => {
                await getDbReady();
                const auth = await getAuth();
                return auth.handler(request);
            },
        },
    },
});
