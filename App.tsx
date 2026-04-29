import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import Preview from './components/Preview';
import TabBar from './components/TabBar';
import VersionHistoryPanel from './components/VersionHistoryPanel';
import { useVersionHistory } from './hooks/useVersionHistory';
import { useTabManager } from './hooks/useTabManager';
import { Version } from './types';

const App: React.FC = () => {
    const {
        tabs,
        activeTabId,
        activeTab,
        setActiveTabId,
        addTab,
        closeTab,
        renameTab,
        updateTabContent,
    } = useTabManager();
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
    const [isReadingMode, setIsReadingMode] = useState(false);
    const [activeView, setActiveView] = useState<'editor' | 'preview'>(
        'editor',
    );

    const markdown = activeTab?.content ?? '';
    const activeTabName = activeTab?.name ?? 'Untitled';

    const { versions, saveVersion } = useVersionHistory((content) => {
        updateTabContent(activeTabId, content);
    });
    const handleSetMarkdown = useCallback(
        (newContent: string) => {
            updateTabContent(activeTabId, newContent);
            saveVersion(newContent);
        },
        [activeTabId, updateTabContent, saveVersion],
    );

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as
            | 'light'
            | 'dark'
            | null;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
        ) {
            setTheme('dark');
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleRevert = (version: Version) => {
        updateTabContent(activeTabId, version.content);
        setIsHistoryPanelOpen(false);
    };

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
};

export default App;
