import React from 'react';
import { Version } from '../types';
import { XIcon, ClockIcon } from './icons';
import {
    borderSubtle,
    btnPrimaryCompact,
    panelSlide,
} from '@/src/lib/ui-classes';

interface VersionHistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    versions: Version[];
    onRevert: (version: Version) => void;
}

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
    isOpen,
    onClose,
    versions,
    onRevert,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            <div className={panelSlide}>
                <div
                    className={`flex items-center justify-between px-6 py-4 border-b ${borderSubtle} bg-surface-muted/50 dark:bg-ink-800/30`}
                >
                    <h2 className="text-lg font-bold tracking-tight text-ink dark:text-stone-100">
                        Version History
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-muted dark:hover:bg-ink-800 transition-colors"
                        aria-label="Close panel"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {versions.length > 0 ? (
                        <ul className={`divide-y ${borderSubtle}`}>
                            {versions.map((version) => (
                                <li
                                    key={version.timestamp}
                                    className="p-5 hover:bg-accent-muted/40 transition-colors"
                                >
                                    <div className="flex justify-between items-center gap-3 mb-2">
                                        <span className="text-sm font-medium text-ink-muted">
                                            {new Date(
                                                version.timestamp,
                                            ).toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => onRevert(version)}
                                            className={btnPrimaryCompact}
                                        >
                                            Revert
                                        </button>
                                    </div>
                                    <p className="text-sm text-ink-faint line-clamp-2 leading-relaxed font-mono">
                                        {version.content.replace(/#+\s*/, '')}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-14 text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-muted mb-4">
                                <ClockIcon className="w-7 h-7 text-accent" />
                            </div>
                            <p className="text-ink-muted font-medium">
                                No versions saved yet.
                            </p>
                            <p className="text-sm text-ink-faint mt-1">
                                Your document history will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VersionHistoryPanel;
