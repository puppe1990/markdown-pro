import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useSession } from '@/src/features/auth/auth-client';

export const Route = createFileRoute('/saved')({
    component: SavedRedirectPage,
});

function SavedRedirectPage() {
    const { data: session, isPending } = useSession();
    const navigate = useNavigate();

    useEffect(() => {
        if (isPending) {
            return;
        }
        if (!session) {
            navigate({ to: '/login' });
            return;
        }
        navigate({
            to: '/dashboard',
            search: { saved: true },
            replace: true,
        });
    }, [session, isPending, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-paper dark:bg-ink-950">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-ink-border border-t-accent" />
        </div>
    );
}
