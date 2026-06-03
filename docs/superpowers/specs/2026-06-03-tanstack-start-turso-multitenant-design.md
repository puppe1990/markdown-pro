# TanStack Start + Turso Multi-tenant Design

## Goal

Migrate markdown-pro from Vite + localStorage to TanStack Start + Turso with per-user data isolation (SaaS multi-tenant).

## Stack

- **TanStack Start** — bundler, router, SSR, server functions
- **TanStack Query** — cache, loading states, optimistic updates on the client
- **Better Auth** — email/password auth, session management, route protection
- **Turso** — distributed SQLite
- **React 19** — already in the project

Deploy target: Netlify. Only needs `TURSO_URL` and `TURSO_AUTH_TOKEN` env vars (plus Better Auth secrets). No separate backend.

## Architecture

```
Browser                        Server (TanStack Start)         Turso
───────                        ────────────────────────         ─────

TanStack Query hooks  ──RPC──→ createServerFn handlers  ──SQL──→ DB
  useTabs()                      ├─ auth.api.getSession()
  useVersions()                  ├─ userId from session
  usePreferences()               └─ WHERE user_id = ?

Token Turso nunca serializado pro client.
```

## Database Schema

Better Auth tables (`user`, `session`, `account`, `verification`) are auto-generated.

App tables:

```sql
CREATE TABLE tabs (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES user(id),
  name       TEXT NOT NULL DEFAULT 'Untitled',
  content    TEXT NOT NULL DEFAULT '',
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE versions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  tab_id     TEXT NOT NULL REFERENCES tabs(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES user(id),
  content    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE preferences (
  user_id    TEXT PRIMARY KEY REFERENCES user(id),
  theme      TEXT NOT NULL CHECK(theme IN ('light', 'dark')) DEFAULT 'light',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_tabs_user_id ON tabs(user_id);
CREATE INDEX idx_versions_tab_id ON versions(tab_id);
CREATE INDEX idx_versions_user_id ON versions(user_id);
```

**Tenant isolation:** every query includes `WHERE user_id = ?`. No user data leaks.

## Server Functions

All under `src/features/<domain>/<domain>.server.ts`. Every handler extracts `userId` from Better Auth session.

### Tabs

| Function       | SQL                                       |
| -------------- | ----------------------------------------- |
| `getTabs()`    | `SELECT * FROM tabs WHERE user_id = ? ORDER BY position` |
| `createTab()`  | `INSERT INTO tabs ... RETURNING *`         |
| `updateTab()`  | `UPDATE tabs SET ... WHERE id = ? AND user_id = ?` |
| `deleteTab()`  | `DELETE FROM tabs WHERE id = ? AND user_id = ?` |
| `reorderTab()` | `UPDATE tabs SET position = ? WHERE id = ? AND user_id = ?` |

### Versions

| Function          | SQL                                                        |
| ----------------- | ---------------------------------------------------------- |
| `getVersions()`   | `SELECT * FROM versions WHERE tab_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 50` |
| `saveVersion()`   | `INSERT INTO versions ...` (trim oldest beyond 50 in handler) |

### Preferences

| Function       | SQL                                     |
| -------------- | --------------------------------------- |
| `getPrefs()`   | `SELECT * FROM preferences WHERE user_id = ?` |
| `setTheme()`   | `INSERT OR REPLACE INTO preferences ...` |

## Client Hooks (TanStack Query)

In `src/features/<domain>/use<Domain>.ts`:

```ts
// tabs
useTabs()         → useQuery({ queryKey: ['tabs'], queryFn: getTabs })
useCreateTab()    → useMutation({ mutationFn: createTab, onSuccess: invalidate })
useUpdateTab()    → useMutation + optimistic update (immediate UI, rollback on error)
useDeleteTab()    → useMutation + optimistic update

// versions
useVersions(tabId)→ useQuery({ queryKey: ['versions', tabId], queryFn: () => getVersions(tabId) })
useSaveVersion()  → useMutation({ mutationFn: saveVersion })

// preferences
usePreferences()  → useQuery({ queryKey: ['prefs'], queryFn: getPrefs })
useSetTheme()     → useMutation + optimistic update
```

## Auth Flow

```
GET /dashboard → layout checks session → no session? redirect /login
GET /login     → Better Auth signIn (email/password)
POST /api/auth/* → Better Auth handler (cookie-based session)

All server fns: auth.api.getSession() → userId → SQL WHERE user_id = ?
```

Better Auth config uses Turso adapter (auth tables auto-migrated to Turso).

## File Structure

```
src/
├── app/
│   ├── __root.tsx              # root layout, QueryClientProvider, Better Auth
│   ├── login.tsx               # email/password login page
│   ├── signup.tsx              # signup page
│   ├── dashboard.tsx           # protected route (current App.tsx content)
│   └── api/
│       └── auth/
│           └── route.ts        # Better Auth handler
│
├── db/
│   ├── client.ts               # createClient singleton (server-only import)
│   └── schema.sql              # DDL for app tables
│
├── features/
│   ├── tabs/
│   │   ├── tabs.server.ts      # createServerFn handlers
│   │   └── useTabs.ts          # TanStack Query hooks
│   ├── versions/
│   │   ├── versions.server.ts
│   │   └── useVersions.ts
│   └── preferences/
│       ├── preferences.server.ts
│       └── usePreferences.ts
│
├── hooks/
│   ├── auth.ts                 # useSession, useSignIn, useSignOut wrappers
│   ├── useTabManager.ts        # → wrapper around features/tabs/useTabs
│   └── useVersionHistory.ts    # → wrapper around features/versions/useVersions
│
├── components/                 # unchanged: Editor, Preview, TabBar, Header, etc.
├── services/                   # unchanged: exportService, imageService
└── types.ts                    # unchanged
```

## Migration from localStorage

On first login after auth:
1. Hooks try to read from localStorage (`markdown-tabs`, `markdown-active-tab-id`, `markdown-versions`, `theme`)
2. If data found, call server fns to persist to Turso
3. Clear localStorage keys
4. All subsequent reads come from Turso via TanStack Query

## What Changes vs Changes Not

**Changes:**
- `App.tsx` → `dashboard.tsx` (route component)
- `index.tsx` → `__root.tsx` (TanStack Start entry)
- `vite.config.ts` replaced by TanStack Start config
- `useTabManager.ts` → wraps TanStack Query hooks (no `useState`, no `useEffect` for localStorage)
- `useVersionHistory.ts` → wraps TanStack Query hooks (no `useState`, no `useEffect` for localStorage)
- Add `auth.ts` hook
- Add login/signup pages

**Unchanged:**
- All visual components (`Editor`, `Preview`, `TabBar`, `VersionHistoryPanel`, `Header`)
- `services/` (exportService, imageService)
- `types.ts`
- CSS/styling
