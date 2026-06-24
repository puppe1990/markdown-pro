import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
    SettingsIcon,
    ClockIcon,
    DownloadIcon,
    UploadIcon,
    CopyIcon,
    CheckIcon,
    FileTextIcon,
    FileIcon,
    FileImage,
    BookOpenIcon,
    UserIcon,
    SaveIcon,
    SpinnerIcon,
} from './icons';
import { BrandMark } from './BrandMark';
import { IconTooltipButton } from './IconTooltipButton';
import {
    exportAsMarkdown,
    exportAsPdf,
    exportAsDocx,
} from '../services/exportService';
import { SyncStatus } from '../hooks/useDebouncedSync';
import SettingsModal from './SettingsModal';
import type { ThemePreference } from '@/src/features/preferences/theme';
import type { AccentColorId } from '@/src/features/preferences/accent';
import {
    borderSubtle,
    btnIcon,
    btnIconActive,
    btnPrimary,
    dropdownItem,
    dropdownMenu,
    surfaceBar,
} from '@/src/lib/ui-classes';

interface HeaderProps {
    themePreference: ThemePreference;
    onThemePreferenceChange: (preference: ThemePreference) => void;
    accentColor: AccentColorId;
    onAccentColorChange: (accentColor: AccentColorId) => void;
    onHistoryClick: () => void;
    onReadingModeToggle: () => void;
    isReadingMode: boolean;
    markdownContent: string;
    onImportMarkdown: (content: string) => void;
    tabName?: string;
    userEmail?: string | null;
    onSignOut?: () => void;
    syncStatus?: SyncStatus;
    onSyncClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    themePreference,
    onThemePreferenceChange,
    accentColor,
    onAccentColorChange,
    onHistoryClick,
    onReadingModeToggle,
    isReadingMode,
    markdownContent,
    onImportMarkdown,
    tabName,
    userEmail,
    onSignOut,
    syncStatus,
    onSyncClick,
}) => {
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleExport = (format: 'md' | 'pdf' | 'docx') => {
        const slug = (tabName ?? 'document')
            .replace(/[^a-z0-9]/gi, '-')
            .toLowerCase();
        const filename =
            slug || `document-${new Date().toISOString().split('T')[0]}`;
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

        if (event.target) {
            event.target.value = '';
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(markdownContent);
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = markdownContent;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setIsCopied(true);
                setTimeout(() => {
                    setIsCopied(false);
                }, 2000);
            } catch {
                alert('Failed to copy markdown to clipboard');
            }
            document.body.removeChild(textArea);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                exportMenuRef.current &&
                !exportMenuRef.current.contains(event.target as Node)
            ) {
                setIsExportMenuOpen(false);
            }
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const syncBtnClass =
        syncStatus === 'saved'
            ? 'p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
            : syncStatus === 'error'
              ? 'p-2 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
              : btnIcon;

    return (
        <header
            className={`relative z-20 flex items-center justify-between px-5 py-3.5 border-b ${borderSubtle} ${surfaceBar} text-ink dark:text-stone-100 flex-shrink-0`}
        >
            <BrandMark size="sm" />
            <div className="flex items-center gap-1">
                <IconTooltipButton
                    tooltip="Import Markdown"
                    onClick={() => importInputRef.current?.click()}
                    className={btnIcon}
                >
                    <UploadIcon className="w-5 h-5" />
                </IconTooltipButton>
                <input
                    type="file"
                    ref={importInputRef}
                    onChange={handleImport}
                    accept=".md,.markdown"
                    className="hidden"
                    aria-hidden="true"
                />
                <IconTooltipButton
                    tooltip={isCopied ? 'Copied!' : 'Copy Markdown'}
                    onClick={handleCopy}
                    className={
                        isCopied
                            ? 'p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                            : btnIcon
                    }
                >
                    {isCopied ? (
                        <CheckIcon className="w-5 h-5" />
                    ) : (
                        <CopyIcon className="w-5 h-5" />
                    )}
                </IconTooltipButton>
                <IconTooltipButton
                    tooltip="Saved documents"
                    onClick={() => navigate({ to: '/saved' })}
                    className={btnIcon}
                >
                    <FileTextIcon className="w-5 h-5" />
                </IconTooltipButton>
                <IconTooltipButton
                    tooltip="Version History"
                    onClick={onHistoryClick}
                    className={btnIcon}
                >
                    <ClockIcon className="w-5 h-5" />
                </IconTooltipButton>
                <IconTooltipButton
                    tooltip={
                        isReadingMode ? 'Exit Reading Mode' : 'Reading Mode'
                    }
                    onClick={onReadingModeToggle}
                    className={isReadingMode ? btnIconActive : btnIcon}
                >
                    <BookOpenIcon className="w-5 h-5" />
                </IconTooltipButton>
                <IconTooltipButton
                    tooltip="Settings"
                    onClick={() => setIsSettingsOpen(true)}
                    className={btnIcon}
                >
                    <SettingsIcon className="w-5 h-5" />
                </IconTooltipButton>
                <SettingsModal
                    isOpen={isSettingsOpen}
                    themePreference={themePreference}
                    onThemePreferenceChange={onThemePreferenceChange}
                    accentColor={accentColor}
                    onAccentColorChange={onAccentColorChange}
                    onClose={() => setIsSettingsOpen(false)}
                />
                {userEmail && (
                    <div className="relative" ref={userMenuRef}>
                        <IconTooltipButton
                            tooltip="User Menu"
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className={btnIcon}
                        >
                            <UserIcon className="w-5 h-5" />
                        </IconTooltipButton>
                        {isUserMenuOpen && (
                            <div className={`${dropdownMenu} w-60`}>
                                <div className="px-3 py-2.5 border-b border-ink-border/40 dark:border-ink-border-dark/40 mb-1">
                                    <p className="text-xs text-ink-faint uppercase tracking-wide font-medium">
                                        Signed in as
                                    </p>
                                    <p className="text-sm text-ink dark:text-stone-200 truncate mt-0.5">
                                        {userEmail}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        onSignOut?.();
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg mx-1 transition-colors font-medium"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {syncStatus && (
                    <IconTooltipButton
                        tooltip={
                            syncStatus === 'saved'
                                ? 'All changes saved'
                                : syncStatus === 'saving'
                                  ? 'Saving...'
                                  : syncStatus === 'error'
                                    ? 'Sync failed - click to retry'
                                    : 'Save changes'
                        }
                        onClick={onSyncClick}
                        className={syncBtnClass}
                    >
                        {syncStatus === 'saved' ? (
                            <CheckIcon className="w-5 h-5" />
                        ) : syncStatus === 'saving' ? (
                            <SpinnerIcon className="w-5 h-5" />
                        ) : (
                            <SaveIcon className="w-5 h-5" />
                        )}
                    </IconTooltipButton>
                )}
                <div className="relative ml-1" ref={exportMenuRef}>
                    <IconTooltipButton
                        tooltip="Export Document"
                        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                        className={`${btnPrimary} py-2`}
                    >
                        <DownloadIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Export</span>
                    </IconTooltipButton>
                    {isExportMenuOpen && (
                        <div className={`${dropdownMenu} w-52`}>
                            <button
                                onClick={() => handleExport('md')}
                                className={dropdownItem}
                            >
                                <FileTextIcon className="w-4 h-4 text-accent" />
                                <span className="font-medium">
                                    Markdown (.md)
                                </span>
                            </button>
                            <button
                                onClick={() => handleExport('pdf')}
                                className={dropdownItem}
                            >
                                <FileImage className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <span className="font-medium">
                                    PDF Document
                                </span>
                            </button>
                            <button
                                onClick={() => handleExport('docx')}
                                className={dropdownItem}
                            >
                                <FileIcon className="w-4 h-4 text-ink-muted" />
                                <span className="font-medium">
                                    Word Document
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
