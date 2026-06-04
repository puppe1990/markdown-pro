# Markdown Pro

Editor de Markdown full-stack com preview em tempo real, múltiplas abas, histórico de versões e exportação. Construído com TanStack Start.

## Stack

- **TanStack Start** — full-stack React framework (SSR, Vite, file-based routing)
- **TanStack Router** — type-safe routing com `scrollRestoration`
- **TanStack Query** — server state, cache e optimistic updates
- **Better Auth** — autenticação com email/senha
- **libSQL** — SQLite via `@libsql/client` (local, in-memory para testes, Turso em produção)
- **TypeScript**, **Vitest**, **Testing Library**, **ESLint**, **Prettier**

## Arquitetura

### Server Functions (RPC)

Lógica de servidor em `createServerFn` do TanStack Start. Chamadas do cliente como funções locais, sem API REST manual.

```
src/features/
├── preferences/preferences.functions.ts  # getPreferences, setTheme
├── tabs/tabs.functions.ts                # getTabs, createTab, updateTab, deleteTab, reorderTab
└── versions/versions.functions.ts        # getVersions, saveVersion
```

### Query Hooks

Hooks finos sobre TanStack Query que consomem as server functions:

```
src/features/
├── preferences/usePreferences.ts  # usePreferences(), useSetTheme() — optimistic
├── tabs/useTabs.ts                # useTabs(), useCreateTab(), useUpdateTab(), useDeleteTab() — optimistic
└── versions/useVersions.ts        # useVersions(tabId), useSaveVersion()
```

### Fluxo de dados

```
Componente UI → hook composto (hooks/useTabManager.ts)
  → optimistic local state
    → mutation hook (@tanstack/react-query)
      → server function (createServerFn)
        → requireAuth() → getDb() → SQL
      → onError: rollback
      → onSettled: invalidate queries
```

### Autenticação

- **Better Auth** como handler em `/api/auth/$`
- `requireAuth()` nas server functions via `getRequest()` + `auth.api.getSession()`
- Cliente React: `auth-client.ts` exporta `signIn`, `signUp`, `signOut`, `useSession`

### Banco de dados

- Schema SQLite com 3 tabelas: `tabs`, `versions`, `preferences`
- Migration automática no startup via `migrateAppSchema()`
- Singleton `getDbReady()` resolve o client uma vez

## Estrutura

```text
src/
├── app/                     # Rotas file-based (TanStack Router)
│   ├── __root.tsx           # Layout root: QueryClientProvider, HTML shell
│   ├── index.tsx            # / → redirect baseado em sessão
│   ├── dashboard.tsx        # /dashboard → editor principal
│   ├── login.tsx            # /login
│   ├── signup.tsx           # /signup
│   └── api/auth/$.ts        # Better Auth handler
├── features/                # Server functions + hooks por domínio
│   ├── auth/                # Config Better Auth + cliente React
│   ├── preferences/         # Tema e preferências
│   ├── tabs/                # CRUD de abas
│   └── versions/            # Histórico de versões
├── db/                      # Client libSQL, migration, schema.sql
├── hooks/                   # Hooks compostos (useTabManager, useVersionHistory, useAutosave)
├── components/              # Componentes UI puros (Editor, Preview, TabBar, Toolbar, Header)
├── services/                # Export (PDF/DOCX/Markdown) e manipulação de imagens
├── router.tsx               # createRouter
└── routeTree.gen.ts         # Route tree auto-gerada
```

## Scripts

```bash
npm run dev          # Vite dev server
npm run build        # Build de produção (client + server)
npm run start        # Inicia o servidor de produção
npm run test         # Vitest run
npm run test:watch   # Vitest watch
npm run lint         # ESLint
npm run lint:fix     # ESLint --fix
npm run format       # Prettier write
npm run format:check # Prettier check
npm run db:migrate   # Gera migration do Better Auth
```

## Começando

### Pré-requisitos

- Node.js 20+
- npm

### Instalar

```bash
npm install
```

### Rodar localmente

```bash
npm run dev
```

O servidor Vite exibe a URL no terminal (geralmente `http://localhost:3000`).

### Banco de dados

Crie um arquivo `.env` baseado em `.env.example`. Para desenvolvimento local:

```env
DATABASE_URL=file:./data.db
```

## Verificação

Antes de abrir ou mergear mudanças:

```bash
npm run test
npm run lint
npm run build
```

## Regras de Desenvolvimento

Diretrizes em [AGENTS.md](./AGENTS.md).
