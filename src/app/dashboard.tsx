import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { useSession, signOut } from '@/src/features/auth/auth-client';
import Header from '@/components/Header';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import TabBar from '@/components/TabBar';
import VersionHistoryPanel from '@/components/VersionHistoryPanel';
import { useTabManager } from '@/hooks/useTabManager';
import { useVersionHistory } from '@/hooks/useVersionHistory';
import {
    usePreferences,
    useSetAccentColor,
    useSetTheme,
} from '@/src/features/preferences/usePreferences';
import { useApplyAccentColor } from '@/src/features/preferences/useApplyAccentColor';
import { Version } from '@/types';
import { useLocalStorageMigration } from '@/src/hooks/useLocalStorageMigration';
import { useDebouncedSync } from '@/hooks/useDebouncedSync';
import {
    useAllTabs,
    useDeleteTab,
    useOpenTab,
    useUpdateTab,
} from '@/src/features/tabs/useTabs';
import SavedDocumentsPanel from '@/components/SavedDocumentsPanel';
import { useSaveVersion } from '@/src/features/versions/useVersions';
import {
    appShell,
    borderSubtle,
    surfaceBar,
    tabActive,
    tabInactive,
} from '@/src/lib/ui-classes';
import { useAppTheme } from '@/src/features/preferences/useAppTheme';

type DashboardSearch = {
    tabId?: string;
    saved?: boolean;
};

export const Route = createFileRoute('/dashboard')({
    validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
        tabId: typeof search.tabId === 'string' ? search.tabId : undefined,
        saved: search.saved === true || search.saved === 'true',
    }),
    component: DashboardPage,
});

function DashboardPage() {
    const { data: session, isPending } = useSession();
    const navigate = useNavigate();
    const { tabId, saved: openSavedFromUrl } = Route.useSearch();
    const { data: prefs } = usePreferences();
    const { mutate: setThemeMutate } = useSetTheme();
    const { mutate: setAccentColorMutate } = useSetAccentColor();

    const themePreference = prefs?.theme ?? 'system';
    const accentColor = prefs?.accentColor ?? 'teal';

    const { resolved: colorScheme } = useAppTheme({
        preference: themePreference,
        onPreferenceChange: (next) => setThemeMutate({ data: { theme: next } }),
    });

    useApplyAccentColor({ accentColor, colorScheme });

    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
    const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);
    const [isReadingMode, setIsReadingMode] = useState(false);
    const [activeView, setActiveView] = useState<'editor' | 'preview'>(
        'editor',
    );

    const {
        tabs,
        activeTabId,
        activeTab,
        isLoading: tabsLoading,
        setActiveTabId,
        addTab,
        closeTab,
        renameTab,
        updateTabContent,
        updateTabContentLocal,
        acknowledgeTabContentSynced,
    } = useTabManager();

    const updateTabMut = useUpdateTab();
    const saveVersionMut = useSaveVersion();
    const { data: savedTabs = [] } = useAllTabs();
    const openTabMut = useOpenTab();
    const deleteTabMut = useDeleteTab();

    const markdown = activeTab?.content ?? '';
    const activeTabName = activeTab?.name ?? 'Untitled';

    const { versions, saveVersion, addLocalVersion } = useVersionHistory(
        (content) => {
            updateTabContent(activeTabId, content);
        },
        activeTabId,
    );

    const syncToServer = useCallback(
        async (id: string, content: string) => {
            await updateTabMut.mutateAsync({ data: { id, content } });
            acknowledgeTabContentSynced(id);
            saveVersionMut.mutate({ data: { tabId: id, content } });
        },
        [updateTabMut, saveVersionMut, acknowledgeTabContentSynced],
    );

    const { syncStatus, syncNow } = useDebouncedSync(
        activeTabId,
        markdown,
        syncToServer,
        10000,
    );

    const handleSetMarkdown = useCallback(
        (newContent: string) => {
            updateTabContentLocal(activeTabId, newContent);
            addLocalVersion(newContent);
        },
        [activeTabId, updateTabContentLocal, addLocalVersion],
    );

    useLocalStorageMigration();

    useEffect(() => {
        if (isPending) return;
        if (!session) {
            navigate({ to: '/login' });
        }
    }, [session, isPending, navigate]);

    useEffect(() => {
        if (!tabId || tabsLoading) {
            return;
        }
        if (tabs.some((tab) => tab.id === tabId)) {
            setActiveTabId(tabId);
            navigate({
                to: '/dashboard',
                search: openSavedFromUrl ? { saved: true } : {},
                replace: true,
            });
        }
    }, [tabId, tabs, tabsLoading, setActiveTabId, navigate, openSavedFromUrl]);

    useEffect(() => {
        if (openSavedFromUrl) {
            setIsSavedPanelOpen(true);
        }
    }, [openSavedFromUrl]);

    const closeSavedPanel = useCallback(() => {
        setIsSavedPanelOpen(false);
        if (openSavedFromUrl) {
            navigate({ to: '/dashboard', search: {}, replace: true });
        }
    }, [navigate, openSavedFromUrl]);

    const handleOpenSavedDocument = useCallback(
        (id: string) => {
            openTabMut.mutate(
                { data: { id } },
                {
                    onSuccess: () => {
                        setActiveTabId(id);
                        closeSavedPanel();
                    },
                },
            );
        },
        [openTabMut, setActiveTabId, closeSavedPanel],
    );

    const handleDeleteSavedDocument = useCallback(
        (id: string) => {
            deleteTabMut.mutate({ data: { id } });
        },
        [deleteTabMut],
    );

    const handleRevert = useCallback(
        (version: Version) => {
            updateTabContent(activeTabId, version.content);
            setIsHistoryPanelOpen(false);
        },
        [activeTabId, updateTabContent],
    );

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-paper dark:bg-ink-950">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-ink-border border-t-accent" />
            </div>
        );
    }

    return (
        <div className={appShell}>
            <Header
                themePreference={themePreference}
                onThemePreferenceChange={(next) =>
                    setThemeMutate({ data: { theme: next } })
                }
                accentColor={accentColor}
                onAccentColorChange={(next) =>
                    setAccentColorMutate({ data: { accentColor: next } })
                }
                onHistoryClick={() => setIsHistoryPanelOpen(true)}
                onSavedDocumentsClick={() => setIsSavedPanelOpen(true)}
                onReadingModeToggle={() => setIsReadingMode(!isReadingMode)}
                isReadingMode={isReadingMode}
                markdownContent={markdown}
                tabName={activeTabName}
                onImportMarkdown={(content) => {
                    updateTabContent(activeTabId, content);
                    saveVersion(content);
                }}
                userEmail={session?.user?.email}
                onSignOut={() => signOut()}
                syncStatus={syncStatus}
                onSyncClick={() => syncNow()}
            />
            <TabBar
                tabs={tabs}
                activeTabId={activeTabId}
                onSelect={setActiveTabId}
                onAdd={addTab}
                onClose={closeTab}
                onRename={renameTab}
            />
            {tabs.length === 0 ? (
                <main className="flex-grow flex items-center justify-center px-6">
                    <div className="text-center max-w-md">
                        <p className="text-ink-muted dark:text-stone-400 mb-4">
                            No open documents. Open a saved document or create a
                            new tab.
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsSavedPanelOpen(true)}
                            className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-hover"
                        >
                            Open saved documents
                        </button>
                    </div>
                </main>
            ) : (
                <main className="flex-grow flex flex-col md:flex-row overflow-hidden workspace-grid">
                    <div
                        className={`md:hidden flex border-b ${borderSubtle} ${surfaceBar}`}
                    >
                        <button
                            onClick={() => setActiveView('editor')}
                            className={`flex-1 p-4 text-sm font-semibold transition-colors ${
                                activeView === 'editor'
                                    ? tabActive
                                    : tabInactive
                            }`}
                        >
                            Write
                        </button>
                        <button
                            onClick={() => setActiveView('preview')}
                            className={`flex-1 p-4 text-sm font-semibold transition-colors ${
                                activeView === 'preview'
                                    ? tabActive
                                    : tabInactive
                            }`}
                        >
                            Preview
                        </button>
                    </div>
                    <div
                        className={`w-full h-full ${activeView === 'editor' ? 'block' : 'hidden'} md:block md:w-1/2 ${isReadingMode ? '!hidden' : ''}`}
                    >
                        <Editor
                            key={activeTabId}
                            value={markdown}
                            onChange={handleSetMarkdown}
                        />
                    </div>
                    <div
                        className={`w-full h-full ${activeView === 'preview' ? 'block' : 'hidden'} md:block ${isReadingMode ? '!w-full !block' : 'md:w-1/2'} border-l ${borderSubtle}`}
                    >
                        <Preview markdown={markdown} />
                    </div>
                </main>
            )}
            <VersionHistoryPanel
                isOpen={isHistoryPanelOpen}
                onClose={() => setIsHistoryPanelOpen(false)}
                versions={versions}
                onRevert={handleRevert}
            />
            {isSavedPanelOpen && (
                <SavedDocumentsPanel
                    tabs={savedTabs}
                    onClose={closeSavedPanel}
                    onOpen={handleOpenSavedDocument}
                    onDelete={handleDeleteSavedDocument}
                />
            )}
        </div>
    );
}
