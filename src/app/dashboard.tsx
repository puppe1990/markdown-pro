import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useState, useEffect } from 'react';
import { useSession, signOut } from '@/src/features/auth/auth-client';
import Header from '@/components/Header';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import TabBar from '@/components/TabBar';
import VersionHistoryPanel from '@/components/VersionHistoryPanel';
import { useTabManager } from '@/hooks/useTabManager';
import { useVersionHistory } from '@/hooks/useVersionHistory';
import { usePreferences } from '@/src/features/preferences/usePreferences';
import { useSetTheme } from '@/src/features/preferences/usePreferences';
import { Version } from '@/types';
import { useLocalStorageMigration } from '@/src/hooks/useLocalStorageMigration';
import { useDebouncedSync } from '@/hooks/useDebouncedSync';
import { useUpdateTab } from '@/src/features/tabs/useTabs';
import { useSaveVersion } from '@/src/features/versions/useVersions';

export const Route = createFileRoute('/dashboard')({
    component: DashboardPage,
});

function DashboardPage() {
    const { data: session, isPending } = useSession();
    const navigate = useNavigate();
    const { data: prefs } = usePreferences();
    const { mutate: setThemeMutate } = useSetTheme();

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme') as
                | 'light'
                | 'dark'
                | null;
            if (saved) return saved;
            if (window.matchMedia?.('(prefers-color-scheme: dark)').matches)
                return 'dark';
        }
        return 'light';
    });

    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
    const [isReadingMode, setIsReadingMode] = useState(false);
    const [activeView, setActiveView] = useState<'editor' | 'preview'>(
        'editor',
    );

    const {
        tabs,
        activeTabId,
        activeTab,
        setActiveTabId,
        addTab,
        closeTab,
        renameTab,
        updateTabContent,
        updateTabContentLocal,
    } = useTabManager();

    const updateTabMut = useUpdateTab();
    const saveVersionMut = useSaveVersion();

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
            saveVersionMut.mutate({ data: { tabId: id, content } });
        },
        [updateTabMut, saveVersionMut],
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
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        if (prefs?.theme && prefs.theme !== theme) {
            setTheme(prefs.theme);
        }
    }, [prefs?.theme, theme, setTheme]);

    useEffect(() => {
        if (isPending) return;
        if (!session) {
            navigate({ to: '/login' });
        }
    }, [session, isPending, navigate]);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === 'light' ? 'dark' : 'light';
            setThemeMutate({ data: { theme: next } });
            return next;
        });
    }, [setThemeMutate]);

    const handleRevert = useCallback(
        (version: Version) => {
            updateTabContent(activeTabId, version.content);
            setIsHistoryPanelOpen(false);
        },
        [activeTabId, updateTabContent],
    );

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen font-sans antialiased bg-gray-50 dark:bg-gray-950">
            <Header
                theme={theme}
                toggleTheme={toggleTheme}
                onHistoryClick={() => setIsHistoryPanelOpen(true)}
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
            <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <div className="md:hidden flex border-b border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                    <button
                        onClick={() => setActiveView('editor')}
                        className={`flex-1 p-4 text-sm font-semibold transition-all duration-200 ${
                            activeView === 'editor'
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        Write
                    </button>
                    <button
                        onClick={() => setActiveView('preview')}
                        className={`flex-1 p-4 text-sm font-semibold transition-all duration-200 ${
                            activeView === 'preview'
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
                    className={`w-full h-full ${activeView === 'preview' ? 'block' : 'hidden'} md:block ${isReadingMode ? '!w-full !block' : 'md:w-1/2'} border-l border-gray-200/60 dark:border-gray-700/60`}
                >
                    <Preview markdown={markdown} />
                </div>
            </main>
            <VersionHistoryPanel
                isOpen={isHistoryPanelOpen}
                onClose={() => setIsHistoryPanelOpen(false)}
                versions={versions}
                onRevert={handleRevert}
            />
        </div>
    );
}
