import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

export interface Version {
    id: number;
    tab_id: string;
    content: string;
    created_at: string;
}

async function requireAuth() {
    const request = getRequest();
    if (!request) throw new Error('No request available in server context');
    const { auth } = await import('@/src/features/auth/auth');
    return auth.api.getSession({ headers: request.headers });
}

export const getVersions = createServerFn({ method: 'GET' })
    .inputValidator((data: unknown) => {
        if (typeof data !== 'object' || data === null)
            throw new Error('Invalid input');
        return { tabId: String((data as Record<string, unknown>).tabId) };
    })
    .handler(async ({ data }): Promise<Version[]> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = await (await import('@/src/db/client')).getDbReady();
        const result = await db.execute({
            sql: `SELECT id, tab_id, content, created_at
                  FROM versions
                  WHERE tab_id = ? AND user_id = ?
                  ORDER BY created_at DESC LIMIT 50`,
            args: [data.tabId, session.user.id],
        });

        return result.rows as unknown as Version[];
    });

export const saveVersion = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => {
        if (typeof data !== 'object' || data === null)
            throw new Error('Invalid input');
        const d = data as Record<string, unknown>;
        return { tabId: String(d.tabId), content: String(d.content) };
    })
    .handler(async ({ data }): Promise<Version> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = await (await import('@/src/db/client')).getDbReady();

        const insertResult = await db.execute({
            sql: `INSERT INTO versions (tab_id, user_id, content)
                  VALUES (?, ?, ?) RETURNING *`,
            args: [data.tabId, session.user.id, data.content],
        });

        await db.execute({
            sql: `DELETE FROM versions
                  WHERE id NOT IN (
                      SELECT id FROM versions
                      WHERE tab_id = ? AND user_id = ?
                      ORDER BY created_at DESC LIMIT 50
                  ) AND tab_id = ? AND user_id = ?`,
            args: [data.tabId, session.user.id, data.tabId, session.user.id],
        });

        return insertResult.rows[0] as unknown as Version;
    });
