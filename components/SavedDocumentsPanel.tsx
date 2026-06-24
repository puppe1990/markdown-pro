import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from './icons';
import ConfirmModal from './ConfirmModal';
import type { SavedTab } from '@/src/features/tabs/tabs.functions';
import { filterSavedTabs } from '@/src/features/tabs/filterSavedTabs';
import {
    btnDanger,
    btnPrimaryCompact,
    btnSecondary,
    placeholderOnSurface,
    textOnSurface,
    textOnSurfaceMuted,
} from '@/src/lib/ui-classes';

interface SavedDocumentsPanelProps {
    tabs: SavedTab[];
    onClose: () => void;
    onOpen: (id: string) => void;
    onDelete: (id: string) => void;
}

function formatUpdatedAt(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString();
}

const SavedDocumentsPanel: React.FC<SavedDocumentsPanelProps> = ({
    tabs,
    onClose,
    onOpen,
    onDelete,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const filteredTabs = useMemo(
        () => filterSavedTabs(tabs, searchQuery),
        [tabs, searchQuery],
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        },
        [onClose],
    );

    useEffect(() => {
        previousFocusRef.current = document.activeElement as HTMLElement | null;
        document.addEventListener('keydown', handleKeyDown);

        const searchInput = dialogRef.current?.querySelector<HTMLElement>(
            'input[type="search"]',
        );
        searchInput?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previousFocusRef.current?.focus();
        };
    }, [handleKeyDown]);

    const confirmDelete = () => {
        if (!pendingDeleteId) {
            return;
        }
        onDelete(pendingDeleteId);
        setPendingDeleteId(null);
    };

    return createPortal(
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    data-testid="modal-backdrop"
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={onClose}
                />
                <div
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="saved-documents-title"
                    className="relative bg-surface dark:bg-ink-900 rounded-2xl shadow-2xl border border-ink-border/50 w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 fade-in duration-200"
                >
                    <div className="flex items-center justify-between px-6 pt-5 pb-3">
                        <h2
                            id="saved-documents-title"
                            className={`text-lg font-bold ${textOnSurface}`}
                        >
                            Saved documents
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="close"
                            className="p-1.5 rounded-lg hover:bg-surface-muted dark:hover:bg-ink-800 transition-colors text-ink-faint hover:text-ink-muted"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="px-6 pb-4">
                        <input
                            type="search"
                            role="searchbox"
                            aria-label="Search documents"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or content"
                            className={`w-full rounded-lg border border-ink-border/60 dark:border-ink-border-dark/60 bg-surface-muted dark:bg-ink-800 px-4 py-2.5 text-sm ${textOnSurface} ${placeholderOnSurface} focus:outline-none focus:ring-2 focus:ring-accent/50`}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2">
                        {filteredTabs.length === 0 ? (
                            <p
                                className={`text-sm ${textOnSurfaceMuted} py-8 text-center`}
                            >
                                No saved documents
                            </p>
                        ) : (
                            filteredTabs.map((tab) => (
                                <div
                                    key={tab.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-ink-border/40 dark:border-ink-border-dark/40 px-4 py-3"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p
                                                className={`text-sm font-semibold truncate ${textOnSurface}`}
                                            >
                                                {tab.name}
                                            </p>
                                            <span
                                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                                    tab.isOpen
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                        : 'bg-surface-muted text-ink-muted dark:bg-ink-800 dark:text-stone-400'
                                                }`}
                                            >
                                                {tab.isOpen ? 'Open' : 'Closed'}
                                            </span>
                                        </div>
                                        <p
                                            className={`text-xs mt-1 ${textOnSurfaceMuted}`}
                                        >
                                            Updated{' '}
                                            {formatUpdatedAt(tab.updatedAt)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => onOpen(tab.id)}
                                            className={btnPrimaryCompact}
                                        >
                                            Open
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPendingDeleteId(tab.id)
                                            }
                                            className={btnDanger}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex justify-end px-6 pb-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className={btnSecondary}
                        >
                            Back to editor
                        </button>
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={pendingDeleteId !== null}
                title="Delete document?"
                message="Delete this document permanently? This cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setPendingDeleteId(null)}
            />
        </>,
        document.body,
    );
};

export default SavedDocumentsPanel;
