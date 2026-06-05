import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { parseAccentColor, type AccentColorId } from './accent';
import { parseThemePreference, type ThemePreference } from './theme';

export interface Preferences {
    theme: ThemePreference;
    accentColor: AccentColorId;
}

const DEFAULT_PREFERENCES: Preferences = {
    theme: 'system',
    accentColor: 'teal',
};

async function requireAuth() {
    const request = getRequest();
    if (!request) throw new Error('No request available in server context');
    const { getAuth } = await import('@/src/features/auth/auth');
    const auth = await getAuth();
    return auth.api.getSession({ headers: request.headers });
}

function isValidAccentColor(value: string): value is AccentColorId {
    return (
        value === 'teal' ||
        value === 'blue' ||
        value === 'violet' ||
        value === 'rose' ||
        value === 'amber' ||
        value === 'emerald'
    );
}

export const getPreferences = createServerFn({ method: 'GET' }).handler(
    async (): Promise<Preferences> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = await (await import('@/src/db/client')).getDbReady();
        const result = await db.execute({
            sql: 'SELECT theme, accent_color FROM preferences WHERE user_id = ?',
            args: [session.user.id],
        });

        if (result.rows.length === 0) {
            return DEFAULT_PREFERENCES;
        }

        const row = result.rows[0] as {
            theme: string;
            accent_color?: string | null;
        };
        return {
            theme: parseThemePreference(row.theme),
            accentColor: parseAccentColor(row.accent_color ?? 'teal'),
        };
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
        const existing = await db.execute({
            sql: 'SELECT accent_color FROM preferences WHERE user_id = ?',
            args: [session.user.id],
        });
        const accentColor = parseAccentColor(
            String(
                (existing.rows[0] as { accent_color?: string } | undefined)
                    ?.accent_color ?? 'teal',
            ),
        );

        await db.execute({
            sql: `INSERT INTO preferences (user_id, theme, accent_color, updated_at)
                  VALUES (?, ?, ?, datetime('now'))
                  ON CONFLICT(user_id) DO UPDATE SET
                      theme = excluded.theme,
                      updated_at = excluded.updated_at`,
            args: [session.user.id, data.theme, accentColor],
        });

        return { theme: data.theme, accentColor };
    });

export const setAccentColor = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => {
        if (typeof data !== 'object' || data === null)
            throw new Error('Invalid input');
        const accentColor = String(
            (data as Record<string, unknown>).accentColor,
        );
        if (!isValidAccentColor(accentColor)) {
            throw new Error(
                `accentColor must be one of: teal, blue, violet, rose, amber, emerald; got "${accentColor}"`,
            );
        }
        return { accentColor };
    })
    .handler(async ({ data }): Promise<Preferences> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = await (await import('@/src/db/client')).getDbReady();
        const existing = await db.execute({
            sql: 'SELECT theme FROM preferences WHERE user_id = ?',
            args: [session.user.id],
        });
        const theme = parseThemePreference(
            String(
                (existing.rows[0] as { theme?: string } | undefined)?.theme ??
                    'system',
            ),
        );

        await db.execute({
            sql: `INSERT INTO preferences (user_id, theme, accent_color, updated_at)
                  VALUES (?, ?, ?, datetime('now'))
                  ON CONFLICT(user_id) DO UPDATE SET
                      accent_color = excluded.accent_color,
                      updated_at = excluded.updated_at`,
            args: [session.user.id, theme, data.accentColor],
        });

        return { theme, accentColor: data.accentColor };
    });
