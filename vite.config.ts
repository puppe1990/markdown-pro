import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import netlify from '@netlify/vite-plugin-tanstack-start';
import viteReact from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    server: {
        port: 3000,
        host: '0.0.0.0',
    },
    resolve: {
        // Netlify functions must use the HTTP-only libSQL client (no native bindings).
        conditions: ['netlify', 'import', 'module', 'browser', 'default'],
    },
    ssr: {
        external: ['libsql', '@libsql/linux-x64-gnu'],
    },
    plugins: [
        tsConfigPaths(),
        tanstackStart({
            router: {
                routesDirectory: 'app',
            },
        }),
        netlify(),
        viteReact(),
    ],
});
