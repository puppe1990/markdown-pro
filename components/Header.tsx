
import React, { useState, useRef, useEffect } from 'react';
import { SunIcon, MoonIcon, ClockIcon, DownloadIcon, UploadIcon, FileTextIcon, FileIcon, FileImage } from './icons';
import { exportAsMarkdown, exportAsPdf, exportAsDocx } from '../services/exportService';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onHistoryClick: () => void;
    markdownContent: string;
    onImportMarkdown: (content: string) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onHistoryClick, markdownContent, onImportMarkdown }) => {
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleExport = (format: 'md' | 'pdf' | 'docx') => {
        const filename = `document-${new Date().toISOString().split('T')[0]}`;
        switch (format) {
            case 'md':
                exportAsMarkdown(markdownContent, `${filename}.md`);
                break;
            case 'pdf':
                exportAsPdf('preview-content', `${filename}.pdf`);
                break;
            case 'docx':
                exportAsDocx('preview-content', `${filename}.docx`);
                break;
        }
        setIsExportMenuOpen(false);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if file is markdown
        if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
            alert('Please select a valid Markdown file (.md or .markdown)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                onImportMarkdown(content);
            }
        };
        reader.onerror = () => {
            alert('An error occurred while reading the file.');
        };
        reader.readAsText(file);

        // Reset input to allow selecting the same file again
        if (event.target) {
            event.target.value = '';
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 text-gray-900 dark:text-gray-100 flex-shrink-0 shadow-sm backdrop-blur-sm">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
                Markdown <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Pro</span>
            </h1>
            <div className="flex items-center space-x-3">
                <button
                    onClick={() => importInputRef.current?.click()}
                    className="p-2.5 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-105 active:scale-95 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                    title="Import Markdown"
                >
                    <UploadIcon className="w-5 h-5" />
                </button>
                <input
                    type="file"
                    ref={importInputRef}
                    onChange={handleImport}
                    accept=".md,.markdown"
                    className="hidden"
                    aria-hidden="true"
                />
                <button
                    onClick={onHistoryClick}
                    className="p-2.5 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-105 active:scale-95 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                    title="Version History"
                >
                    <ClockIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-105 active:scale-95 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                    title="Toggle Theme"
                >
                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
                <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                        title="Export Document"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    {isExportMenuOpen && (
                        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl py-2 z-10 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
                            <button onClick={() => handleExport('md')} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-700/50 flex items-center space-x-3 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg">
                                <FileTextIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="font-medium">Markdown (.md)</span>
                            </button>
                            <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-700/50 flex items-center space-x-3 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg">
                                <FileImage className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <span className="font-medium">PDF Document</span>
                            </button>
                            <button onClick={() => handleExport('docx')} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-700/50 flex items-center space-x-3 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg">
                                <FileIcon className="w-4 h-4 text-blue-700 dark:text-blue-500" />
                                <span className="font-medium">Word Document</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
