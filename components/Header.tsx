
import React, { useState, useRef, useEffect } from 'react';
import { SunIcon, MoonIcon, ClockIcon, DownloadIcon, FileTextIcon, FileIcon, FileImage } from './icons';
import { exportAsMarkdown, exportAsPdf, exportAsDocx } from '../services/exportService';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onHistoryClick: () => void;
    markdownContent: string;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onHistoryClick, markdownContent }) => {
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

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
        <header className="flex items-center justify-between p-2 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex-shrink-0">
            <h1 className="text-xl font-bold tracking-tight">Markdown <span className="text-blue-500">Pro</span></h1>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onHistoryClick}
                    className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Version History"
                >
                    <ClockIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Toggle Theme"
                >
                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
                <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                        className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                        title="Export Document"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                    {isExportMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10 border dark:border-gray-600">
                            <button onClick={() => handleExport('md')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2">
                                <FileTextIcon className="w-4 h-4" />
                                <span>Markdown (.md)</span>
                            </button>
                            <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2">
                                <FileImage className="w-4 h-4" />
                                <span>PDF Document</span>
                            </button>
                            <button onClick={() => handleExport('docx')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2">
                                <FileIcon className="w-4 h-4" />
                                <span>Word Document</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
