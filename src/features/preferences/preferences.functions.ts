import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { parseThemePreference, type ThemePreference } from './theme';

export interface Preferences {
    theme: ThemePreference;
}

async function requireAuth() {
    const request = getRequest();
    if (!request) throw new Error('No request available in server context');
    const { getAuth } = await import('@/src/features/auth/auth');
    const auth = await getAuth();
    return auth.api.getSession({ headers: request.headers });
}

export const getPreferences = createServerFn({ method: 'GET' }).handler(
    async (): Promise<Preferences> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = await (await import('@/src/db/client')).getDbReady();
        const result = await db.execute({
            sql: 'SELECT theme FROM preferences WHERE user_id = ?',
            args: [session.user.id],
        });

        if (result.rows.length === 0) {
            return { theme: 'system' };
        }

        const stored = (result.rows[0] as { theme: string }).theme;
        return { theme: parseThemePreference(stored) };
    },
);

export const setTheme = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => {
        if (typeof data !== 'object' || data === null)
            throw new Error('Invalid input');
        const theme = String((data as Record<string, unknown>).theme);
        if (theme !== 'light' && theme !== 'dark' && theme !== 'system') {
            throw new Error('theme must be "light", "dark", or "system"');
        }
        return { theme: theme as ThemePreference };
    })
    .handler(async ({ data }): Promise<Preferences> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = await (await import('@/src/db/client')).getDbReady();
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
