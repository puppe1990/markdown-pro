import type { ManifestOptions } from 'vite-plugin-pwa';

export const PWA_THEME_COLOR = '#2563eb';
export const PWA_BACKGROUND_COLOR = '#ffffff';

export const pwaManifest: Partial<ManifestOptions> = {
    name: 'Markdown Pro',
    short_name: 'Markdown Pro',
    description:
        'Markdown editor with real-time preview, tabs, version history, and export.',
    theme_color: PWA_THEME_COLOR,
    background_color: PWA_BACKGROUND_COLOR,
    display: 'standalone',
    orientation: 'any',
    start_url: '/',
    scope: '/',
    lang: 'en',
    categories: ['productivity', 'utilities'],
    icons: [
        {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
        },
        {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
        },
        {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
        },
    ],
};
