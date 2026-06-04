import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/src/features/auth/auth';
import { getDbReady } from '@/src/db/client';

export const Route = createFileRoute('/api/auth/$')({
    server: {
        handlers: {
            GET: async ({ request }) => {
                await getDbReady();
                return auth.handler(request);
            },
            POST: async ({ request }) => {
                try {
                    await getDbReady();
                    return await auth.handler(request);
                } catch (err) {
                    console.error('Auth handler error:', {
                        message:
                            err instanceof Error ? err.message : String(err),
                        stack: err instanceof Error ? err.stack : undefined,
                        url: request.url,
                        method: request.method,
                    });
                    throw err;
                }
            },
        },
    },
});
