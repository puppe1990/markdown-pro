import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { auth } from '@/src/features/auth/auth';
import { getDb } from '@/src/db/client';

export interface Preferences {
    theme: 'light' | 'dark';
}

function requireAuth() {
    const request = getRequest();
    if (!request) throw new Error('No request available in server context');
    return auth.api.getSession({ headers: request.headers });
}

export const getPreferences = createServerFn({ method: 'GET' }).handler(async (): Promise<Preferences> => {
    const session = await requireAuth();
    if (!session) throw new Error('Unauthorized');

    const db = getDb();
    const result = await db.execute({
        sql: 'SELECT theme FROM preferences WHERE user_id = ?',
        args: [session.user.id],
    });

    if (result.rows.length === 0) {
        return { theme: 'light' };
    }

    return { theme: (result.rows[0] as { theme: string }).theme as 'light' | 'dark' };
});

export const setTheme = createServerFn({ method: 'POST' })
    .validator((data: unknown) => {
        if (typeof data !== 'object' || data === null) throw new Error('Invalid input');
        const theme = String((data as Record<string, unknown>).theme);
        if (theme !== 'light' && theme !== 'dark') {
            throw new Error('theme must be "light" or "dark"');
        }
        return { theme: theme as 'light' | 'dark' };
    })
    .handler(async ({ data }): Promise<Preferences> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = getDb();
        await db.execute({
            sql: `INSERT INTO preferences (user_id, theme, updated_at)
                  VALUES (?, ?, datetime('now'))
                  ON CONFLICT(user_id) DO UPDATE SET
                      theme = excluded.theme,
                      updated_at = excluded.updated_at`,
            args: [session.user.id, data.theme],
        });

        return { theme: data.theme };
    });
