# TanStack Start + Turso Multi-tenant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate markdown-pro from Vite + localStorage to TanStack Start + Turso + Better Auth with per-user data isolation (SaaS multi-tenant).

**Architecture:** TanStack Start handles SSR + server functions; TanStack Query caches on the client; Better Auth manages email/password sessions with a cookie; Turso stores everything with `WHERE user_id = ?` on every query. No backend — just `createServerFn` handlers that live in the same repo.

**Tech Stack:** TanStack Start, TanStack Query, TanStack Router, Better Auth, Turso (`@libsql/client`), React 19, Tailwind CSS (CDN), vitest

**Env vars needed** (create `.env` before starting):

```bash
TURSO_DATABASE_URL=libsql://your-db-org.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-random-secret
```

---

## File Map

```
Create:
  app.config.ts                                   # TanStack Start config
  vitest.config.ts                                # Vitest config (extracted from vite.config.ts)
  src/db/client.ts                                # Turso client singleton
  src/db/schema.sql                               # App DDL
  src/features/auth/auth.ts                       # Better Auth config
  src/app/api/auth/$.ts                           # Better Auth API route handler
  src/app/__root.tsx                              # Root layout (providers, document shell)
  src/app/index.tsx                               # Landing: redirect to /dashboard or /login
  src/app/login.tsx                               # Email/password login page
  src/app/signup.tsx                              # Signup page
  src/app/dashboard.tsx                           # Protected route (migrated App.tsx)
  src/features/tabs/tabs.server.ts                # Tabs createServerFn handlers
  src/features/tabs/useTabs.ts                    # TanStack Query hooks for tabs
  src/features/versions/versions.server.ts        # Versions createServerFn handlers
  src/features/versions/useVersions.ts            # TanStack Query hooks for versions
  src/features/preferences/preferences.server.ts  # Preferences createServerFn handlers
  src/features/preferences/usePreferences.ts      # TanStack Query hooks for preferences
  src/features/auth/auth-client.ts                # createAuthClient instance (exports signIn, signUp, signOut, useSession)
  src/hooks/useLocalStorageMigration.ts           # One-time import from localStorage to Turso

Modify:
  package.json                                    # Add/remove deps, update scripts
  .gitignore                                      # Add .env
  index.html                                      # Update for TanStack Start
  src/hooks/useTabManager.ts                      # Refactor to use TanStack Query
  src/hooks/useVersionHistory.ts                  # Refactor to use TanStack Query
  tsconfig.json                                   # Update paths/compiler options for TanStack Start

Delete:
  vite.config.ts                                  # Replaced by app.config.ts
  index.tsx                                       # Replaced by src/app/__root.tsx
  App.tsx                                         # Migrated to src/app/dashboard.tsx
  App.test.tsx                                    # Tests moved to dashboard test
  App.integration.test.tsx                        # Integration tests moved
```

---

### Task 1: Install dependencies and update package.json

**Files:**
- Modify: `package.json`
- Create: `.env`

- [ ] **Step 1: Install new dependencies**

```bash
npm install @tanstack/react-start @tanstack/react-router @tanstack/react-query @libsql/client better-auth
```

- [ ] **Step 2: Update package.json scripts**

Replace the `scripts` block in `package.json`:

```json
"scripts": {
    "dev": "vinxi dev",
    "build": "vinxi build",
    "start": "vinxi start",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier . --write",
    "format:check": "prettier . --check",
    "prepare": "husky",
    "precommit": "lint-staged && npm run test",
    "test": "vitest run",
    "test:watch": "vitest"
}
```

Note: `vinxi` is included in `@tanstack/react-start` — no separate install needed.

- [ ] **Step 3: Create `.env` with placeholder values**

```bash
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-at-least-32-chars
```

- [ ] **Step 4: Add `.env` to `.gitignore`**

Append to `.gitignore`:

```
.env
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore .env.example
git commit -m "chore: add TanStack Start, Turso, Better Auth deps; update scripts"
```

---

### Task 2: Create app.config.ts (TanStack Start configuration)

**Files:**
- Create: `app.config.ts`

- [ ] **Step 1: Write `app.config.ts`**

```ts
import { defineConfig } from '@tanstack/react-start/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    tsr: {
        appDirectory: 'src/app',
    },
    vite: {
        plugins: [tsConfigPaths()],
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
    },
});
```

- [ ] **Step 2: Install vite-tsconfig-paths**

```bash
npm install -D vite-tsconfig-paths
```

- [ ] **Step 3: Verify config is valid**

```bash
npx vinxi dev --help
```
Expected: shows Vinxi help output (confirms TanStack Start is installed correctly).

- [ ] **Step 4: Commit**

```bash
git add app.config.ts package.json package-lock.json
git commit -m "feat: add TanStack Start config"
```

---

### Task 3: Extract vitest config from vite.config.ts

**Files:**
- Create: `vitest.config.ts`
- Delete: `vite.config.ts`

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['**/*.test.{ts,tsx}'],
    },
});
```

- [ ] **Step 2: Delete `vite.config.ts`**

```bash
rm vite.config.ts
```

- [ ] **Step 3: Run tests to verify config works**

```bash
npx vitest run
```
Expected: tests run (may fail — that's OK at this stage, we just need the config to parse).

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts && git rm vite.config.ts
git commit -m "refactor: extract vitest config from vite.config.ts"
```

---

### Task 4: Update index.html for TanStack Start

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace `index.html` content**

TanStack Start needs a minimal template. Remove the CDN imports (they move to `src/app/__root.tsx` head section) and the importmap:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Markdown Pro</title>
        <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
        <script>
            tailwind.config = {
                darkMode: 'class',
                theme: {
                    extend: {
                        animation: {
                            in: 'in 0.2s ease-out',
                            'fade-in': 'fade-in 0.2s ease-out',
                            'slide-in-from-right':
                                'slide-in-from-right 0.3s ease-out',
                            'slide-in-from-top-2':
                                'slide-in-from-top-2 0.2s ease-out',
                        },
                        keyframes: {
                            in: {
                                '0%': { opacity: '0' },
                                '100%': { opacity: '1' },
                            },
                            'fade-in': {
                                '0%': { opacity: '0' },
                                '100%': { opacity: '1' },
                            },
                            'slide-in-from-right': {
                                '0%': { transform: 'translateX(100%)' },
                                '100%': { transform: 'translateX(0)' },
                            },
                            'slide-in-from-top-2': {
                                '0%': {
                                    transform: 'translateY(-8px)',
                                    opacity: '0',
                                },
                                '100%': {
                                    transform: 'translateY(0)',
                                    opacity: '1',
                                },
                            },
                        },
                    },
                },
            };
        </script>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body {
                font-family:
                    'Inter',
                    -apple-system,
                    BlinkMacSystemFont,
                    'Segoe UI',
                    sans-serif;
            }
            * {
                scroll-behavior: smooth;
            }
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            ::-webkit-scrollbar-track {
                background: transparent;
            }
            ::-webkit-scrollbar-thumb {
                background: rgba(156, 163, 175, 0.5);
                border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: rgba(156, 163, 175, 0.7);
            }
            .dark ::-webkit-scrollbar-thumb {
                background: rgba(75, 85, 99, 0.5);
            }
            .dark ::-webkit-scrollbar-thumb:hover {
                background: rgba(75, 85, 99, 0.7);
            }
        </style>
    </head>
    <body class="bg-white dark:bg-gray-900">
        <div id="root"></div>
        <script type="module" src="/src/app/__root.tsx"></script>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
        <script src="https://unpkg.com/html-to-docx@1.8.0/dist/html-to-docx.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dompurify@2.4.0/dist/purify.min.js"></script>
    </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "refactor: update index.html for TanStack Start template"
```

---

### Task 5: Create Turso database client

**Files:**
- Create: `src/db/client.ts`

- [ ] **Step 1: Write `src/db/client.ts`**

```ts
import { createClient } from '@libsql/client';

let dbInstance: ReturnType<typeof createClient> | null = null;

export function getDb() {
    if (dbInstance) return dbInstance;

    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        throw new Error(
            'TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in environment variables',
        );
    }

    dbInstance = createClient({ url, authToken });
    return dbInstance;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/db/client.ts
git commit -m "feat: add Turso database client"
```

---

### Task 6: Create database schema

**Files:**
- Create: `src/db/schema.sql`

- [ ] **Step 1: Write `src/db/schema.sql`**

```sql
CREATE TABLE IF NOT EXISTS tabs (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    name       TEXT NOT NULL DEFAULT 'Untitled',
    content    TEXT NOT NULL DEFAULT '',
    position   INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS versions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    tab_id     TEXT NOT NULL,
    user_id    TEXT NOT NULL,
    content    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (tab_id) REFERENCES tabs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS preferences (
    user_id    TEXT PRIMARY KEY,
    theme      TEXT NOT NULL CHECK(theme IN ('light', 'dark')) DEFAULT 'light',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tabs_user_id ON tabs(user_id);
CREATE INDEX IF NOT EXISTS idx_tabs_user_position ON tabs(user_id, position);
CREATE INDEX IF NOT EXISTS idx_versions_tab_id ON versions(tab_id);
CREATE INDEX IF NOT EXISTS idx_versions_user_id ON versions(user_id);
```

- [ ] **Step 2: Run schema against Turso**

```bash
npx turso db shell < src/db/schema.sql
```

Or via the Turso CLI:

```bash
cat src/db/schema.sql | turso db shell your-db-name
```

- [ ] **Step 3: Verify tables exist**

```bash
turso db shell your-db-name ".tables"
```
Expected: lists `preferences`, `tabs`, `versions` (and Better Auth tables after Task 7).

- [ ] **Step 4: Commit**

```bash
git add src/db/schema.sql
git commit -m "feat: add database schema for tabs, versions, preferences"
```

---

### Task 7: Setup Better Auth

**Files:**
- Create: `src/features/auth/auth.ts`

- [ ] **Step 1: Write `src/features/auth/auth.ts`**

```ts
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
```

- [ ] **Step 2: Verify auth config compiles**

```bash
npx tsc --noEmit src/features/auth/auth.ts
```
Expected: no errors (besides unrelated project errors).

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/auth.ts
git commit -m "feat: add Better Auth configuration with email/password"
```

---

### Task 8: Create Better Auth API route

**Files:**
- Create: `src/app/api/auth/$.ts`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p src/app/api/auth
```

- [ ] **Step 2: Write `src/app/api/auth/$.ts`**

```ts
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { auth } from '@/src/features/auth/auth';

export const APIRoute = createAPIFileRoute('/api/auth/$')({
    GET: ({ request }) => auth.handler(request),
    POST: ({ request }) => auth.handler(request),
});
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/$.ts
git commit -m "feat: add Better Auth API route handler"
```

---

### Task 9: Create tabs server functions

**Files:**
- Create: `src/features/tabs/tabs.server.ts`

- [ ] **Step 1: Write `src/features/tabs/tabs.server.ts`**

```ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { auth } from '@/src/features/auth/auth';
import { getDb } from '@/src/db/client';

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

function requireAuth() {
    const request = getWebRequest();
    if (!request) throw new Error('No request available in server context');
    return auth.api.getSession({ headers: request.headers });
}

function tabRowToTab(row: TabRow): Tab {
    return { id: row.id, name: row.name, content: row.content };
}

export const getTabs = createServerFn({ method: 'GET' }).handler(async (): Promise<Tab[]> => {
    const session = await requireAuth();
    if (!session) throw new Error('Unauthorized');

    const db = getDb();
    const result = await db.execute({
        sql: `SELECT id, user_id, name, content, position, created_at, updated_at
              FROM tabs WHERE user_id = ? ORDER BY position`,
        args: [session.user.id],
    });

    return (result.rows as unknown as TabRow[]).map(tabRowToTab);
});

export const createTab = createServerFn({ method: 'POST' })
    .validator((data: unknown) => {
        if (typeof data !== 'object' || data === null) throw new Error('Invalid input');
        const d = data as Record<string, unknown>;
        return {
            id: String(d.id),
            name: String(d.name ?? 'Untitled'),
        };
    })
    .handler(async ({ data }): Promise<Tab> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = getDb();
        const countResult = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM tabs WHERE user_id = ?',
            args: [session.user.id],
        });
        const position = Number((countResult.rows[0] as { count: number }).count);

        const result = await db.execute({
            sql: `INSERT INTO tabs (id, user_id, name, content, position)
                  VALUES (?, ?, ?, '', ?) RETURNING *`,
            args: [data.id, session.user.id, data.name, position],
        });

        return tabRowToTab(result.rows[0] as unknown as TabRow);
    });

export const updateTab = createServerFn({ method: 'POST' })
    .validator((data: unknown) => {
        if (typeof data !== 'object' || data === null) throw new Error('Invalid input');
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

        const db = getDb();
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
    .validator((data: unknown) => {
        if (typeof data !== 'object' || data === null) throw new Error('Invalid input');
        return { id: String((data as Record<string, unknown>).id) };
    })
    .handler(async ({ data }): Promise<void> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = getDb();
        await db.execute({
            sql: 'DELETE FROM tabs WHERE id = ? AND user_id = ?',
            args: [data.id, session.user.id],
        });
    });

export const reorderTab = createServerFn({ method: 'POST' })
    .validator((data: unknown) => {
        if (typeof data !== 'object' || data === null) throw new Error('Invalid input');
        const d = data as Record<string, unknown>;
        return { id: String(d.id), position: Number(d.position) };
    })
    .handler(async ({ data }): Promise<void> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = getDb();
        await db.execute({
            sql: 'UPDATE tabs SET position = ? WHERE id = ? AND user_id = ?',
            args: [data.position, data.id, session.user.id],
        });
    });
```

- [ ] **Step 2: Commit**

```bash
git add src/features/tabs/tabs.server.ts
git commit -m "feat: add tabs server functions (CRUD + reorder)"
```

---

### Task 10: Create tabs hooks

**Files:**
- Create: `src/features/tabs/useTabs.ts`

- [ ] **Step 1: Write `src/features/tabs/useTabs.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getTabs,
    createTab,
    updateTab,
    deleteTab,
    type Tab,
} from './tabs.server';

export function useTabs() {
    return useQuery({
        queryKey: ['tabs'],
        queryFn: () => getTabs(),
    });
}

export function useCreateTab() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createTab,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tabs'] }),
    });
}

export function useUpdateTab() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateTab,
        onMutate: async (input) => {
            await qc.cancelQueries({ queryKey: ['tabs'] });
            const previous = qc.getQueryData<Tab[]>(['tabs']);
            qc.setQueryData<Tab[]>(['tabs'], (old) =>
                old?.map((t) =>
                    t.id === input.id
                        ? { ...t, name: input.name ?? t.name, content: input.content ?? t.content }
                        : t,
                ),
            );
            return { previous };
        },
        onError: (_err, _input, context) => {
            qc.setQueryData(['tabs'], context?.previous);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ['tabs'] }),
    });
}

export function useDeleteTab() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteTab,
        onMutate: async (input) => {
            await qc.cancelQueries({ queryKey: ['tabs'] });
            const previous = qc.getQueryData<Tab[]>(['tabs']);
            qc.setQueryData<Tab[]>(['tabs'], (old) => old?.filter((t) => t.id !== input.id));
            return { previous };
        },
        onError: (_err, _input, context) => {
            qc.setQueryData(['tabs'], context?.previous);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ['tabs'] }),
    });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/tabs/useTabs.ts
git commit -m "feat: add tabs TanStack Query hooks with optimistic updates"
```

---

### Task 11: Create versions server functions

**Files:**
- Create: `src/features/versions/versions.server.ts`

- [ ] **Step 1: Write `src/features/versions/versions.server.ts`**

```ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { auth } from '@/src/features/auth/auth';
import { getDb } from '@/src/db/client';

export interface Version {
    id: number;
    tab_id: string;
    content: string;
    created_at: string;
}

function requireAuth() {
    const request = getWebRequest();
    if (!request) throw new Error('No request available in server context');
    return auth.api.getSession({ headers: request.headers });
}

export const getVersions = createServerFn({ method: 'GET' })
    .validator((data: unknown) => {
        if (typeof data !== 'object' || data === null) throw new Error('Invalid input');
        return { tabId: String((data as Record<string, unknown>).tabId) };
    })
    .handler(async ({ data }): Promise<Version[]> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = getDb();
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
    .validator((data: unknown) => {
        if (typeof data !== 'object' || data === null) throw new Error('Invalid input');
        const d = data as Record<string, unknown>;
        return { tabId: String(d.tabId), content: String(d.content) };
    })
    .handler(async ({ data }): Promise<Version> => {
        const session = await requireAuth();
        if (!session) throw new Error('Unauthorized');

        const db = getDb();

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
```

- [ ] **Step 2: Commit**

```bash
git add src/features/versions/versions.server.ts
git commit -m "feat: add versions server functions (get, save with 50 cap)"
```

---

### Task 12: Create versions hooks

**Files:**
- Create: `src/features/versions/useVersions.ts`

- [ ] **Step 1: Write `src/features/versions/useVersions.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVersions, saveVersion, type Version } from './versions.server';

export function useVersions(tabId: string | undefined) {
    return useQuery({
        queryKey: ['versions', tabId],
        queryFn: () => getVersions({ data: { tabId: tabId! } }),
        enabled: !!tabId,
    });
}

export function useSaveVersion() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: saveVersion,
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ['versions', variables.tabId] });
        },
    });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/versions/useVersions.ts
git commit -m "feat: add versions TanStack Query hooks"
```

---

### Task 13: Create preferences server functions

**Files:**
- Create: `src/features/preferences/preferences.server.ts`

- [ ] **Step 1: Write `src/features/preferences/preferences.server.ts`**

```ts
import { createServerFn } from '@tanstack/react-start';
import { getWebRequest } from '@tanstack/react-start/server';
import { auth } from '@/src/features/auth/auth';
import { getDb } from '@/src/db/client';

export interface Preferences {
    theme: 'light' | 'dark';
}

function requireAuth() {
    const request = getWebRequest();
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
```

- [ ] **Step 2: Commit**

```bash
git add src/features/preferences/preferences.server.ts
git commit -m "feat: add preferences server functions (get, setTheme)"
```

---

### Task 14: Create preferences hooks

**Files:**
- Create: `src/features/preferences/usePreferences.ts`

- [ ] **Step 1: Write `src/features/preferences/usePreferences.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPreferences, setTheme, type Preferences } from './preferences.server';

export function usePreferences() {
    return useQuery({
        queryKey: ['preferences'],
        queryFn: () => getPreferences(),
    });
}

export function useSetTheme() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: setTheme,
        onMutate: async (input) => {
            await qc.cancelQueries({ queryKey: ['preferences'] });
            const previous = qc.getQueryData<Preferences>(['preferences']);
            qc.setQueryData<Preferences>(['preferences'], { theme: input.theme });
            return { previous };
        },
        onError: (_err, _input, context) => {
            qc.setQueryData(['preferences'], context?.previous);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ['preferences'] }),
    });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/preferences/usePreferences.ts
git commit -m "feat: add preferences TanStack Query hooks with optimistic update"
```

---

### Task 15: Create auth client

**Files:**
- Create: `src/features/auth/auth-client.ts`

- [ ] **Step 1: Write `src/features/auth/auth-client.ts`**

Better Auth's client has a reactive `useSession` hook that auto-tracks the session cookie. No need for manual AuthContext.

```ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
```

- [ ] **Step 2: Commit**

```bash
mkdir -p src/features/auth && git add src/features/auth/auth-client.ts
git commit -m "feat: add Better Auth client with useSession"
```

---

### Task 16: Create login and signup pages

**Files:**
- Create: `src/app/login.tsx`
- Create: `src/app/signup.tsx`

- [ ] **Step 1: Write `src/app/login.tsx`**

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { signIn } from '@/src/features/auth/auth-client';

export const Route = createFileRoute('/login')({
    component: LoginPage,
});

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const result = await signIn.email({ email, password });
        if (result.error) {
            setError(result.error.message ?? 'Login failed.');
            return;
        }
        navigate({ to: '/dashboard' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                    Markdown Pro
                </h1>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                        Sign In
                    </button>
                </form>
                <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                    Don&apos;t have an account?{' '}
                    <a href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Write `src/app/signup.tsx`**

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { signUp } from '@/src/features/auth/auth-client';

export const Route = createFileRoute('/signup')({
    component: SignupPage,
});

function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const result = await signUp.email({ email, password, name });
        if (result.error) {
            setError(result.error.message ?? 'Signup failed.');
            return;
        }
        navigate({ to: '/dashboard' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                    Create Account
                </h1>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                        Create Account
                    </button>
                </form>
                <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/login.tsx src/app/signup.tsx
git commit -m "feat: add login and signup pages"
```

---

### Task 17: Create root layout (__root.tsx)

**Files:**
- Create: `src/app/__root.tsx`

- [ ] **Step 1: Write `src/app/__root.tsx`**

Better Auth's `useSession()` is reactive — it auto-updates when the session cookie changes. No manual AuthContext needed.

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 30_000, retry: 1 },
    },
});

export const Route = createRootRoute({
    component: () => (
        <QueryClientProvider client={queryClient}>
            <Outlet />
        </QueryClientProvider>
    ),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/app/__root.tsx
git commit -m "feat: add root layout with QueryClient provider"
```

---

### Task 18: Create landing page (redirect based on auth)

**Files:**
- Create: `src/app/index.tsx`

- [ ] **Step 1: Write `src/app/index.tsx`**

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useSession } from '@/src/features/auth/auth-client';

export const Route = createFileRoute('/')({
    component: IndexPage,
});

function IndexPage() {
    const navigate = useNavigate();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (isPending) return;
        navigate({ to: session ? '/dashboard' : '/login' });
    }, [session, isPending, navigate]);

    return null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/index.tsx
git commit -m "feat: add landing page with auth-based redirect"
```

---

### Task 19: Create dashboard route (migrate App.tsx)

**Files:**
- Create: `src/app/dashboard.tsx`
- Delete: `App.tsx`

- [ ] **Step 1: Write `src/app/dashboard.tsx`**

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useState, useEffect } from 'react';
import { useSession, signOut } from '@/src/features/auth/auth-client';
import Header from '@/components/Header';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import TabBar from '@/components/TabBar';
import VersionHistoryPanel from '@/components/VersionHistoryPanel';
import { useTabManager } from '@/hooks/useTabManager';
import { useVersionHistory } from '@/hooks/useVersionHistory';
import { usePreferences } from '@/src/features/preferences/usePreferences';
import { useSetTheme } from '@/src/features/preferences/usePreferences';
import { Version } from '@/types';
import { useLocalStorageMigration } from '@/src/hooks/useLocalStorageMigration';

export const Route = createFileRoute('/dashboard')({
    component: DashboardPage,
});

function DashboardPage() {
    const { data: session, isPending } = useSession();
    const navigate = useNavigate();
    const { data: prefs } = usePreferences();
    const { mutate: setThemeMutate } = useSetTheme();

    const preferredTheme = prefs?.theme ?? 'light';

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
            if (saved) return saved;
            if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
        }
        return 'light';
    });

    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
    const [isReadingMode, setIsReadingMode] = useState(false);
    const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');

    const {
        tabs,
        activeTabId,
        activeTab,
        setActiveTabId,
        addTab,
        closeTab,
        renameTab,
        updateTabContent,
    } = useTabManager();

    const markdown = activeTab?.content ?? '';
    const activeTabName = activeTab?.name ?? 'Untitled';

    const { versions, saveVersion } = useVersionHistory((content) => {
        updateTabContent(activeTabId, content);
    });

    const handleSetMarkdown = useCallback(
        (newContent: string) => {
            updateTabContent(activeTabId, newContent);
            saveVersion(newContent);
        },
        [activeTabId, updateTabContent, saveVersion],
    );

    useLocalStorageMigration(activeTabId);

    useEffect(() => {
        if (preferredTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [preferredTheme]);

    useEffect(() => {
        if (isPending) return;
        if (!session) {
            navigate({ to: '/login' });
        }
    }, [session, isPending, navigate]);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === 'light' ? 'dark' : 'light';
            setThemeMutate({ data: { theme: next } });
            return next;
        });
    }, [setThemeMutate]);

    const handleRevert = useCallback(
        (version: Version) => {
            updateTabContent(activeTabId, version.content);
            setIsHistoryPanelOpen(false);
        },
        [activeTabId, updateTabContent],
    );

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen font-sans antialiased bg-gray-50 dark:bg-gray-950">
            <div className="flex items-center justify-between px-6 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200/60 dark:border-gray-700/60">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {session?.user?.email}
                </span>
                <button
                    onClick={signOut}
                    className="text-sm px-3 py-1 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-950/50 transition-colors"
                >
                    Sign Out
                </button>
            </div>
            <Header
                theme={theme}
                toggleTheme={toggleTheme}
                onHistoryClick={() => setIsHistoryPanelOpen(true)}
                onReadingModeToggle={() => setIsReadingMode(!isReadingMode)}
                isReadingMode={isReadingMode}
                markdownContent={markdown}
                tabName={activeTabName}
                onImportMarkdown={(content) => {
                    updateTabContent(activeTabId, content);
                    saveVersion(content);
                }}
            />
            <TabBar
                tabs={tabs}
                activeTabId={activeTabId}
                onSelect={setActiveTabId}
                onAdd={addTab}
                onClose={closeTab}
                onRename={renameTab}
            />
            <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <div className="md:hidden flex border-b border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveView('editor')}
                        className={`flex-1 p-4 text-sm font-semibold transition-all duration-200 ${
                            activeView === 'editor'
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        Write
                    </button>
                    <button
                        onClick={() => setActiveView('preview')}
                        className={`flex-1 p-4 text-sm font-semibold transition-all duration-200 ${
                            activeView === 'preview'
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        Preview
                    </button>
                </div>

                <div
                    className={`w-full h-full ${activeView === 'editor' ? 'block' : 'hidden'} md:block md:w-1/2 ${isReadingMode ? '!hidden' : ''}`}
                >
                    <Editor
                        key={activeTabId}
                        value={markdown}
                        onChange={handleSetMarkdown}
                    />
                </div>
                <div
                    className={`w-full h-full ${activeView === 'preview' ? 'block' : 'hidden'} md:block ${isReadingMode ? '!w-full !block' : 'md:w-1/2'} border-l border-gray-200/60 dark:border-gray-700/60`}
                >
                    <Preview markdown={markdown} />
                </div>
            </main>
            <VersionHistoryPanel
                isOpen={isHistoryPanelOpen}
                onClose={() => setIsHistoryPanelOpen(false)}
                versions={versions}
                onRevert={handleRevert}
            />
        </div>
    );
}
```

- [ ] **Step 2: Delete `App.tsx`**

```bash
rm App.tsx
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard.tsx && git rm App.tsx
git commit -m "feat: migrate App.tsx to dashboard route with auth guard"
```

---

### Task 20: Refactor useTabManager hook

**Files:**
- Modify: `src/hooks/useTabManager.ts`

- [ ] **Step 1: Rewrite `src/hooks/useTabManager.ts`**

```ts
import { useState, useCallback } from 'react';
import { useTabs, useCreateTab, useUpdateTab, useDeleteTab } from '@/src/features/tabs/useTabs';
import { Tab as TqTab } from '@/src/features/tabs/tabs.server';

export interface Tab {
    id: string;
    name: string;
    content: string;
}

let counter = 0;
const newId = () => {
    const id = `tab-${Date.now()}-${++counter}`;
    return id;
};

const defaultTab = (): Tab => ({ id: newId(), name: 'Untitled', content: '' });

export function useTabManager() {
    const { data: remoteTabs, isLoading } = useTabs();
    const createTabMut = useCreateTab();
    const updateTabMut = useUpdateTab();
    const deleteTabMut = useDeleteTab();

    const [localTabs, setLocalTabs] = useState<Tab[]>(() => {
        if (typeof window === 'undefined') return [defaultTab()];
        try {
            const stored = localStorage.getItem('markdown-tabs');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed as Tab[];
            }
        } catch { /* ignore */ }
        return [defaultTab()];
    });

    const [activeTabId, setActiveTabIdState] = useState(() => {
        if (typeof window === 'undefined') return localTabs[0]?.id ?? '';
        const stored = localStorage.getItem('markdown-active-tab-id');
        return stored || localTabs[0]?.id ?? '';
    });

    const tabs = remoteTabs && remoteTabs.length > 0 ? remoteTabs : localTabs;

    const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

    const setActiveTabId = useCallback((id: string) => {
        setActiveTabIdState(tabs.some((t) => t.id === id) ? id : (tabs[0]?.id ?? ''));
    }, [tabs]);

    const addTab = useCallback(() => {
        const id = newId();
        const name = tabs.length === 0 ? 'Untitled' : `Untitled ${tabs.length + 1}`;
        const newTab: Tab = { id, name, content: '' };
        setLocalTabs((prev) => [...prev, newTab]);
        setActiveTabIdState(id);
        createTabMut.mutate({ data: { id, name } });
    }, [tabs.length, createTabMut]);

    const closeTab = useCallback((id: string) => {
        if (tabs.length === 1) return;
        setLocalTabs((prev) => prev.filter((t) => t.id !== id));
        deleteTabMut.mutate({ data: { id } });
        setActiveTabIdState((prevActive) => {
            if (prevActive !== id) return prevActive;
            const remaining = tabs.filter((t) => t.id !== id);
            return remaining[0]?.id ?? '';
        });
    }, [tabs, deleteTabMut]);

    const renameTab = useCallback((id: string, name: string) => {
        setLocalTabs((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
        updateTabMut.mutate({ data: { id, name } });
    }, [updateTabMut]);

    const updateTabContent = useCallback((id: string, content: string) => {
        setLocalTabs((prev) => prev.map((t) => (t.id === id ? { ...t, content } : t)));
        updateTabMut.mutate({ data: { id, content } });
    }, [updateTabMut]);

    return {
        tabs,
        activeTabId,
        activeTab,
        isLoading,
        setActiveTabId,
        addTab,
        closeTab,
        renameTab,
        updateTabContent,
    };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useTabManager.ts
git commit -m "refactor: useTabManager to consume TanStack Query + sync to Turso"
```

---

### Task 21: Refactor useVersionHistory hook

**Files:**
- Modify: `src/hooks/useVersionHistory.ts`

- [ ] **Step 1: Rewrite `src/hooks/useVersionHistory.ts`**

```ts
import { useState, useCallback } from 'react';
import { useVersions, useSaveVersion } from '@/src/features/versions/useVersions';
import { Version as DbVersion } from '@/src/features/versions/versions.server';
import { Version } from '@/types';

export function useVersionHistory(
    setMarkdown: (content: string) => void,
    activeTabId?: string,
) {
    const { data: remoteVersions } = useVersions(activeTabId);
    const saveVersionMut = useSaveVersion();

    const [localVersions, setLocalVersions] = useState<Version[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem('markdown-versions');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed as Version[];
            }
        } catch { /* ignore */ }
        return [];
    });

    const remoteMapped: Version[] = (remoteVersions ?? []).map((v: DbVersion) => ({
        content: v.content,
        timestamp: new Date(v.created_at).getTime(),
    }));

    const versions =
        remoteMapped.length > 0
            ? remoteMapped
            : localVersions;

    const saveVersion = useCallback(
        (content: string) => {
            setLocalVersions((prev) => {
                const latest = prev[0];
                if (latest && latest.content === content) return prev;

                const newVersion: Version = { content, timestamp: Date.now() };
                const updated = [newVersion, ...prev].slice(0, 50);
                return updated;
            });

            if (activeTabId) {
                saveVersionMut.mutate({ data: { tabId: activeTabId, content } });
            }
        },
        [activeTabId, saveVersionMut],
    );

    const revertToVersion = useCallback(
        (versionIndex: number) => {
            const versionToRevert = versions[versionIndex];
            if (versionToRevert) {
                setMarkdown(versionToRevert.content);
            }
        },
        [versions, setMarkdown],
    );

    return { versions, saveVersion, revertToVersion };
}
```

- [ ] **Step 2: Update `useVersionHistory` signature in `dashboard.tsx`**

The call site in `dashboard.tsx` now needs to pass `activeTabId`:

In `src/app/dashboard.tsx`, change:

```tsx
const { versions, saveVersion } = useVersionHistory((content) => {
    updateTabContent(activeTabId, content);
});
```

to:

```tsx
const { versions, saveVersion } = useVersionHistory(
    (content) => {
        updateTabContent(activeTabId, content);
    },
    activeTabId,
);
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useVersionHistory.ts src/app/dashboard.tsx
git commit -m "refactor: useVersionHistory to consume TanStack Query + sync to Turso"
```

---

### Task 22: Create localStorage migration hook

**Files:**
- Create: `src/hooks/useLocalStorageMigration.ts`

- [ ] **Step 1: Write `src/hooks/useLocalStorageMigration.ts`**

```ts
import { useEffect, useRef } from 'react';
import { useCreateTab, useUpdateTab } from '@/src/features/tabs/useTabs';
import { useSaveVersion } from '@/src/features/versions/useVersions';
import { useSetTheme } from '@/src/features/preferences/usePreferences';
import { useTabs } from '@/src/features/tabs/useTabs';

const MIGRATION_KEY = 'markdown-pro-migrated-v1';

export function useLocalStorageMigration(activeTabId: string) {
    const hasRun = useRef(false);
    const { data: remoteTabs } = useTabs();
    const createTab = useCreateTab();
    const updateTab = useUpdateTab();
    const saveVersion = useSaveVersion();
    const setTheme = useSetTheme();

    useEffect(() => {
        if (hasRun.current) return;
        if (typeof window === 'undefined') return;

        const alreadyMigrated = localStorage.getItem(MIGRATION_KEY);
        if (alreadyMigrated) return;

        hasRun.current = true;

        const tabsRaw =
            localStorage.getItem('markdown-tabs') ??
            localStorage.getItem('markdown-content');
        const versionsRaw = localStorage.getItem('markdown-versions');
        const activeTabIdRaw = localStorage.getItem('markdown-active-tab-id');
        const themeRaw = localStorage.getItem('theme') as
            | 'light'
            | 'dark'
            | null;

        const migrate = async () => {
            if (!remoteTabs || remoteTabs.length > 0) {
                localStorage.setItem(MIGRATION_KEY, '1');
                return;
            }

            try {
                let tabs: { id: string; name: string; content: string }[] = [];
                if (tabsRaw) {
                    const parsed = JSON.parse(tabsRaw);
                    if (Array.isArray(parsed)) tabs = parsed;
                } else {
                    tabs = [{ id: 'default', name: 'Untitled', content: '' }];
                }

                for (const tab of tabs) {
                    await createTab.mutateAsync({
                        data: { id: tab.id, name: tab.name },
                    });
                    if (tab.content) {
                        await updateTab.mutateAsync({
                            data: { id: tab.id, content: tab.content },
                        });
                    }
                }

                if (versionsRaw) {
                    const versions = JSON.parse(versionsRaw);
                    if (Array.isArray(versions)) {
                        const activeTab =
                            tabs.find((t) => t.id === activeTabIdRaw) ?? tabs[0];
                        if (activeTab) {
                            for (const v of versions.slice(0, 50)) {
                                await saveVersion.mutateAsync({
                                    data: { tabId: activeTab.id, content: v.content },
                                });
                            }
                        }
                    }
                }

                if (themeRaw) {
                    await setTheme.mutateAsync({ data: { theme: themeRaw } });
                }

                localStorage.setItem(MIGRATION_KEY, '1');
                localStorage.removeItem('markdown-tabs');
                localStorage.removeItem('markdown-content');
                localStorage.removeItem('markdown-versions');
                localStorage.removeItem('markdown-active-tab-id');
                localStorage.removeItem('theme');
            } catch {
                /* Migration failed silently. Data stays in localStorage as fallback. */
                hasRun.current = false;
            }
        };

        migrate();
    }, [remoteTabs, createTab, updateTab, saveVersion, setTheme]);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useLocalStorageMigration.ts
git commit -m "feat: add localStorage to Turso migration on first login"
```

---

### Task 23: Update tsconfig.json for TanStack Start

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: Update `tsconfig.json`**

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "ESNext",
        "lib": ["ES2022", "DOM", "DOM.Iterable"],
        "skipLibCheck": true,
        "moduleResolution": "bundler",
        "isolatedModules": true,
        "moduleDetection": "force",
        "allowJs": true,
        "jsx": "react-jsx",
        "paths": {
            "@/*": ["./*"]
        },
        "allowImportingTsExtensions": true,
        "noEmit": true,
        "strict": true,
        "esModuleInterop": true
    },
    "include": ["**/*.ts", "**/*.tsx"]
}
```

- [ ] **Step 2: Commit**

```bash
git add tsconfig.json
git commit -m "chore: update tsconfig for TanStack Start"
```

---

### Task 24: Delete old entry points and test files

**Files:**
- Delete: `index.tsx`
- Delete: `App.test.tsx`
- Delete: `App.integration.test.tsx`

- [ ] **Step 1: Remove old files**

```bash
rm index.tsx App.test.tsx App.integration.test.tsx
```

- [ ] **Step 2: Update `useTabManager.test.ts` imports to match new hook location**

Read `hooks/useTabManager.test.ts` and update any import paths that changed.

- [ ] **Step 3: Commit**

```bash
git rm index.tsx App.test.tsx App.integration.test.tsx
git commit -m "chore: remove old Vite entry point and stale test files"
```

---

### Task 25: Verify the build

**Files:**
- None (verification only)

- [ ] **Step 1: Start the dev server**

```bash
npx vinxi dev
```
Expected: TanStack Start dev server starts on port 3000. Visit `http://localhost:3000`.

- [ ] **Step 2: Verify auth flow**

1. Visit `/` → should redirect to `/login`
2. Go to `/signup` → create an account
3. After signup → should redirect to `/dashboard`
4. Dashboard shows empty editor with "Sign Out" and email in top bar
5. Sign out → should redirect to `/login`
6. Sign in with the same credentials → `/dashboard` restores data

- [ ] **Step 3: Verify CRUD operations**

1. Create a tab → type content → switch tabs → content persists per tab
2. Close a tab → tab removed
3. Refresh page → data still there
4. Check version history panel → versions saved

- [ ] **Step 4: Verify localStorage migration**

1. Before first login, ensure localStorage has `markdown-tabs` with data
2. Login → dashboard loads → localStorage keys cleared, data in Turso
3. Refresh → data still there, loaded from Turso

- [ ] **Step 5: Verify multi-tenant isolation**

1. Sign out → sign up with a different email
2. Dashboard shows empty tabs (not the previous user's data)
3. Create tabs with different content
4. Sign out → sign back in as first user → see first user's data

- [ ] **Step 6: Run tests**

```bash
npm test
```
Expected: tests that don't depend on localStorage persistence should pass. Tests that depended on the old hook internals may need updates (covered in follow-up tasks).

- [ ] **Step 7: Run build**

```bash
npx vinxi build
```
Expected: production build succeeds.

---

### Task 26: Update Netlify deployment config

**Files:**
- Create: `netlify.toml` (or update existing)

- [ ] **Step 1: Write `netlify.toml`**

```toml
[build]
  command = "npx vinxi build"
  publish = "dist/client"

[build.environment]
  NODE_VERSION = "22"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] **Step 2: Set environment variables in Netlify dashboard**

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `BETTER_AUTH_URL` (set to your Netlify domain)
- `BETTER_AUTH_SECRET`

- [ ] **Step 3: Deploy and verify**

Push to main → Netlify deploys → visit URL → auth → dashboard works.

- [ ] **Step 4: Final commit**

```bash
git add netlify.toml
git commit -m "chore: add Netlify deployment config"
```
