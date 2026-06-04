import type { Plugin } from 'vite';
import { generatePwaServiceWorker } from './workbox';

/** TanStack Start builds client and SSR separately; vite-plugin-pwa skips SW on SSR. */
export function tanstackPwaServiceWorker(): Plugin {
    return {
        name: 'tanstack-pwa-service-worker',
        apply: 'build',
        closeBundle: {
            order: 'post',
            async handler() {
                const environment = this.environment;
                if (environment.name !== 'client') {
                    return;
                }

                await generatePwaServiceWorker();
            },
        },
    };
}
