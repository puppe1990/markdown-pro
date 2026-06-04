import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import netlify from '@netlify/vite-plugin-tanstack-start';
import viteReact from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';
import { pwaManifest } from './src/pwa/manifest';
import { pwaRuntimeCaching } from './src/pwa/workbox';
import { tanstackPwaServiceWorker } from './src/pwa/vitePlugin';

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
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: false,
            includeAssets: [
                'favicon-16x16.png',
                'favicon-32x32.png',
                'apple-touch-icon.png',
            ],
            manifest: pwaManifest,
            workbox: {
                navigateFallback: null,
                runtimeCaching: pwaRuntimeCaching,
            },
        }),
        tanstackPwaServiceWorker(),
    ],
});
