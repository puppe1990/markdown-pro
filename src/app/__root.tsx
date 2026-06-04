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
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            },
        ],
    }),
    component: RootComponent,
    notFoundComponent: NotFoundPage,
});

function NotFoundPage() {
    return (
        <main className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-gray-900">
            <div className="text-center space-y-4">
                <p className="text-sm font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    404
                </p>
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                    Page not found
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    The page you are looking for does not exist or may have been
                    moved.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700"
                >
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
                        __html: `
                            tailwind.config = {
                                darkMode: 'class',
                                theme: {
                                    extend: {
                                        animation: {
                                            in: 'in 0.2s ease-out',
                                            'fade-in': 'fade-in 0.2s ease-out',
                                            'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
                                            'slide-in-from-top-2': 'slide-in-from-top-2 0.2s ease-out',
                                        },
                                        keyframes: {
                                            in: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                                            'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                                            'slide-in-from-right': {
                                                '0%': { transform: 'translateX(100%)' },
                                                '100%': { transform: 'translateX(0)' },
                                            },
                                            'slide-in-from-top-2': {
                                                '0%': { transform: 'translateY(-8px)', opacity: '0' },
                                                '100%': { transform: 'translateY(0)', opacity: '1' },
                                            },
                                        },
                                    },
                                },
                            };
                        `,
                    }}
                />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                            body {
                                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            }
                            * { scroll-behavior: smooth; }
                            ::-webkit-scrollbar { width: 8px; height: 8px; }
                            ::-webkit-scrollbar-track { background: transparent; }
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
                        `,
                    }}
                />
            </head>
            <body className="bg-white dark:bg-gray-900">
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
