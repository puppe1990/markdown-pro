import type { ReactNode } from 'react';
import { useEffect } from 'react';
import {
    createRootRoute,
    HeadContent,
    Link,
    Outlet,
    Scripts,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    FONT_STYLESHEET,
    GLOBAL_CSS,
    TAILWIND_CONFIG_SCRIPT,
} from '@/src/lib/global-styles';
import { btnPrimary } from '@/src/lib/ui-classes';
import { PWA_THEME_COLOR } from '@/src/pwa/manifest';
import { registerPwa } from '@/src/pwa/registerPwa';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 30_000, retry: 1 },
    },
});

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: 'utf-8' },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1.0',
            },
            { title: 'Markdown Pro' },
            {
                name: 'description',
                content:
                    'Markdown editor with real-time preview, tabs, version history, and export.',
            },
            { name: 'theme-color', content: PWA_THEME_COLOR },
            { name: 'mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            {
                name: 'apple-mobile-web-app-status-bar-style',
                content: 'default',
            },
            { name: 'apple-mobile-web-app-title', content: 'Markdown Pro' },
        ],
        links: [
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '32x32',
                href: '/favicon-32x32.png',
            },
            {
                rel: 'icon',
                type: 'image/png',
                sizes: '16x16',
                href: '/favicon-16x16.png',
            },
            {
                rel: 'apple-touch-icon',
                sizes: '180x180',
                href: '/apple-touch-icon.png',
            },
            { rel: 'manifest', href: '/manifest.webmanifest' },
            { rel: 'stylesheet', href: FONT_STYLESHEET },
        ],
    }),
    component: RootComponent,
    notFoundComponent: NotFoundPage,
});

function NotFoundPage() {
    return (
        <main className="min-h-screen flex items-center justify-center px-4 bg-paper dark:bg-ink-950 auth-glow">
            <div className="text-center space-y-5">
                <p className="text-sm font-semibold uppercase tracking-widest text-accent">
                    404
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-ink dark:text-stone-100">
                    Page not found
                </h1>
                <p className="text-ink-muted max-w-md leading-relaxed">
                    The page you are looking for does not exist or may have been
                    moved.
                </p>
                <Link to="/" className={btnPrimary}>
                    Back to home
                </Link>
            </div>
        </main>
    );
}

function RootComponent() {
    useEffect(() => {
        registerPwa();
    }, []);

    return (
        <RootDocument>
            <QueryClientProvider client={queryClient}>
                <Outlet />
            </QueryClientProvider>
        </RootDocument>
    );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
                <script src="https://cdn.tailwindcss.com?plugins=typography" />
                <script
                    dangerouslySetInnerHTML={{
                        __html: TAILWIND_CONFIG_SCRIPT,
                    }}
                />
                <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
            </head>
            <body className="bg-paper dark:bg-ink-950 text-ink dark:text-stone-100">
                {children}
                <Scripts />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" />
                <script src="https://unpkg.com/html-to-docx@1.8.0/dist/html-to-docx.js" />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js" />
                <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" />
                <script src="https://cdn.jsdelivr.net/npm/dompurify@2.4.0/dist/purify.min.js" />
            </body>
        </html>
    );
}
