import type { ReactNode } from 'react';
import { BrandMark } from './BrandMark';
import { useAppTheme } from '@/src/features/preferences/useAppTheme';

interface AuthShellProps {
    title?: string;
    children: ReactNode;
}

/** Centered auth layout with ambient glow and elevated card. */
export function AuthShell({ title, children }: AuthShellProps) {
    useAppTheme({ preference: 'system' });

    return (
        <div className="auth-glow min-h-screen flex items-center justify-center bg-paper dark:bg-ink-950 relative overflow-hidden px-4 py-12">
            <div className="relative w-full max-w-md">
                <div className="mb-8 text-center space-y-2">
                    <BrandMark size="lg" centered />
                    {title && (
                        <p className="text-sm text-ink-muted font-medium">
                            {title}
                        </p>
                    )}
                </div>
                <div className="p-8 sm:p-10 bg-surface/95 dark:bg-ink-900/95 rounded-2xl shadow-2xl border border-ink-border/50 backdrop-blur-sm">
                    {children}
                </div>
            </div>
        </div>
    );
}
