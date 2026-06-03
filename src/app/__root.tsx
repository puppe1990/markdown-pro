import type { ReactNode } from 'react';
import {
    createRootRoute,
    HeadContent,
    Outlet,
    Scripts,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
        ],
        links: [
            { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            },
        ],
    }),
    component: RootComponent,
});

function RootComponent() {
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
