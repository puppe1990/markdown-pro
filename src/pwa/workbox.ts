import type { GenerateSWOptions, RuntimeCaching } from 'workbox-build';

export const PWA_CLIENT_OUTPUT_DIR = 'dist/client';

export const pwaRuntimeCaching: RuntimeCaching[] = [
    {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
            cacheName: 'google-fonts-stylesheets',
            expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
            },
        },
    },
    {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
            cacheName: 'google-fonts-webfonts',
            expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
            },
        },
    },
];

export const pwaWorkboxOptions: GenerateSWOptions = {
    globDirectory: PWA_CLIENT_OUTPUT_DIR,
    globPatterns: ['**/*.{js,css,html,ico,png,woff2,webmanifest}'],
    swDest: `${PWA_CLIENT_OUTPUT_DIR}/sw.js`,
    navigateFallback: null,
    runtimeCaching: pwaRuntimeCaching,
};

/** Generates the service worker after the client bundle is written. */
export async function generatePwaServiceWorker(): Promise<void> {
    const { generateSW } = await import('workbox-build');
    await generateSW(pwaWorkboxOptions);
}
