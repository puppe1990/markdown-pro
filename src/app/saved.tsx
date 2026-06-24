import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect } from 'react';
import { useSession } from '@/src/features/auth/auth-client';
import SavedDocumentsPanel from '@/components/SavedDocumentsPanel';
import {
    useAllTabs,
    useDeleteTab,
    useOpenTab,
} from '@/src/features/tabs/useTabs';
import { appShell } from '@/src/lib/ui-classes';

export const Route = createFileRoute('/saved')({
    component: SavedPage,
});

function SavedPage() {
    const { data: session, isPending } = useSession();
    const navigate = useNavigate();
    const { data: tabs = [], isLoading } = useAllTabs();
    const openTabMut = useOpenTab();
    const deleteTabMut = useDeleteTab();

    useEffect(() => {
        if (isPending) {
            return;
        }
        if (!session) {
            navigate({ to: '/login' });
        }
    }, [session, isPending, navigate]);

    const handleClose = useCallback(() => {
        navigate({ to: '/dashboard' });
    }, [navigate]);

    const handleOpen = useCallback(
        (id: string) => {
            openTabMut.mutate(
                { data: { id } },
                {
                    onSuccess: () => {
                        navigate({
                            to: '/dashboard',
                            search: { tabId: id },
                        });
                    },
                },
            );
        },
        [navigate, openTabMut],
    );

    const handleDelete = useCallback(
        (id: string) => {
            deleteTabMut.mutate({ data: { id } });
        },
        [deleteTabMut],
    );

    if (isPending || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-paper dark:bg-ink-950">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-ink-border border-t-accent" />
            </div>
        );
    }

    return (
        <div className={appShell}>
            <SavedDocumentsPanel
                tabs={tabs}
                onClose={handleClose}
                onOpen={handleOpen}
                onDelete={handleDelete}
            />
        </div>
    );
}
