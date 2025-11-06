
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import Preview from './components/Preview';
import VersionHistoryPanel from './components/VersionHistoryPanel';
import { useAutosave } from './hooks/useAutosave';
import { useVersionHistory } from './hooks/useVersionHistory';
import { Version } from './types';

const App: React.FC = () => {
    const [markdown, setMarkdown] = useState<string>('# Welcome to Markdown Pro!\n\nStart typing to see the magic happen.');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
    const [activeView, setActiveView] = useState<'editor' | 'preview'>('editor');

    const { versions, saveVersion, revertToVersion } = useVersionHistory(setMarkdown);
    useAutosave(markdown, 1000);

    const handleSetMarkdown = useCallback((newContent: string) => {
        setMarkdown(newContent);
        saveVersion(newContent);
    }, [saveVersion]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const initialMarkdown = localStorage.getItem('markdown-content');
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
        if (initialMarkdown) {
            setMarkdown(initialMarkdown);
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
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    const handleRevert = (version: Version) => {
      setMarkdown(version.content);
      setIsHistoryPanelOpen(false);
    }

    return (
        <div className="flex flex-col h-screen font-sans">
            <Header 
                theme={theme} 
                toggleTheme={toggleTheme}
                onHistoryClick={() => setIsHistoryPanelOpen(true)}
                markdownContent={markdown}
            />
            <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
                <div className="md:hidden flex border-b border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => setActiveView('editor')}
                        className={`flex-1 p-3 text-sm font-medium ${activeView === 'editor' ? 'bg-gray-100 dark:bg-gray-800 text-blue-500' : 'bg-white dark:bg-gray-900'}`}
                    >
                        Write
                    </button>
                    <button 
                        onClick={() => setActiveView('preview')}
                        className={`flex-1 p-3 text-sm font-medium ${activeView === 'preview' ? 'bg-gray-100 dark:bg-gray-800 text-blue-500' : 'bg-white dark:bg-gray-900'}`}
                    >
                        Preview
                    </button>
                </div>

                <div className={`w-full h-full ${activeView === 'editor' ? 'block' : 'hidden'} md:block md:w-1/2`}>
                    <Editor value={markdown} onChange={handleSetMarkdown} />
                </div>
                <div className={`w-full h-full ${activeView === 'preview' ? 'block' : 'hidden'} md:block md:w-1/2 border-l border-gray-200 dark:border-gray-700`}>
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
