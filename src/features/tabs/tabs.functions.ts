import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

interface TabRow {
    id: string;
    user_id: string;
    name: string;
    content: string;
    position: number;
    created_at: string;
    updated_at: string;
}

export interface Tab {
    id: string;
    name: string;
    content: string;
}

async function requireAuth() {
    const request = getRequest();
    if (!request) throw new Error('No request available in server context');
    const { getAuth } = await import('@/src/features/auth/auth');
    const auth = await getAuth();
    return auth.api.getSession({ headers: request.headers });
}

function tabRowToTab(row: TabRow): Tab {
    return { id: row.id, name: row.name, content: row.content };
}

export const getTabs = createServerFn({ method: 'GET' }).handler(
    async (): Promise<Tab[]> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = await (await import('@/src/db/client')).getDbReady();
        const result = await db.execute({
            sql: `SELECT id, user_id, name, content, position, created_at, updated_at
              FROM tabs WHERE user_id = ? ORDER BY position`,
            args: [session.user.id],
        });

        return (result.rows as unknown as TabRow[]).map(tabRowToTab);
    },
);

export const createTab = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => {
        if (typeof data !== 'object' || data === null)
            throw new Error('Invalid input');
        const d = data as Record<string, unknown>;
        return {
            id: String(d.id),
            name: String(d.name ?? 'Untitled'),
        };
    })
    .handler(async ({ data }): Promise<Tab> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = await (await import('@/src/db/client')).getDbReady();
        const countResult = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM tabs WHERE user_id = ?',
            args: [session.user.id],
        });
        const position = Number(
            (countResult.rows[0] as { count: number }).count,
        );

        const result = await db.execute({
            sql: `INSERT INTO tabs (id, user_id, name, content, position)
                  VALUES (?, ?, ?, '', ?) RETURNING *`,
            args: [data.id, session.user.id, data.name, position],
        });

        return tabRowToTab(result.rows[0] as unknown as TabRow);
    });

export const updateTab = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => {
        if (typeof data !== 'object' || data === null)
            throw new Error('Invalid input');
        const d = data as Record<string, unknown>;
        return {
            id: String(d.id),
            name: d.name !== undefined ? String(d.name) : undefined,
            content: d.content !== undefined ? String(d.content) : undefined,
        };
    })
    .handler(async ({ data }): Promise<Tab> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = await (await import('@/src/db/client')).getDbReady();
        const sets: string[] = [];
        const args: (string | number)[] = [];

        if (data.name !== undefined) {
            sets.push('name = ?');
            args.push(data.name);
        }
        if (data.content !== undefined) {
            sets.push('content = ?');
            args.push(data.content);
        }
        sets.push("updated_at = datetime('now')");
        args.push(data.id, session.user.id);

        const result = await db.execute({
            sql: `UPDATE tabs SET ${sets.join(', ')} WHERE id = ? AND user_id = ? RETURNING *`,
            args,
        });
        if (result.rows.length === 0) throw new Error('Tab not found');
        return tabRowToTab(result.rows[0] as unknown as TabRow);
    });

export const deleteTab = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => {
        if (typeof data !== 'object' || data === null)
            throw new Error('Invalid input');
        return { id: String((data as Record<string, unknown>).id) };
    })
    .handler(async ({ data }): Promise<void> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = await (await import('@/src/db/client')).getDbReady();
        await db.execute({
            sql: 'DELETE FROM tabs WHERE id = ? AND user_id = ?',
            args: [data.id, session.user.id],
        });
    });

export const reorderTab = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => {
        if (typeof data !== 'object' || data === null)
            throw new Error('Invalid input');
        const d = data as Record<string, unknown>;
        return { id: String(d.id), position: Number(d.position) };
    })
    .handler(async ({ data }): Promise<void> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = await (await import('@/src/db/client')).getDbReady();
        await db.execute({
            sql: 'UPDATE tabs SET position = ? WHERE id = ? AND user_id = ?',
            args: [data.position, data.id, session.user.id],
        });
    });
