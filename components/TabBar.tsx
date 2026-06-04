import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Tab } from '../hooks/useTabManager';
import ConfirmModal from './ConfirmModal';
import {
    borderSubtle,
    surfaceBar,
    tabActive,
    tabInactive,
} from '@/src/lib/ui-classes';

interface Props {
    tabs: Tab[];
    activeTabId: string;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onClose: (id: string) => void;
    onRename: (id: string, name: string) => void;
}

const TabBar: React.FC<Props> = ({
    tabs,
    activeTabId,
    onSelect,
    onAdd,
    onClose,
    onRename,
}) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [pendingCloseId, setPendingCloseId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const tabRefs = useRef<Map<string, HTMLElement>>(new Map());
    const prevTabsLength = useRef(tabs.length);

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

    useEffect(() => {
        if (tabs.length > prevTabsLength.current) {
            const newestTab = tabs[tabs.length - 1];
            if (newestTab && newestTab.id === activeTabId) {
                const el = tabRefs.current.get(newestTab.id);
                el?.focus();
            }
        }
        prevTabsLength.current = tabs.length;
    }, [tabs.length, activeTabId, tabs]);

    const setTabRef = useCallback(
        (id: string) => (el: HTMLDivElement | null) => {
            if (el) {
                tabRefs.current.set(id, el);
            } else {
                tabRefs.current.delete(id);
            }
        },
        [],
    );

    const startEdit = (tab: Tab) => {
        setEditingId(tab.id);
        setEditValue(tab.name);
    };

    const commitEdit = () => {
        if (editingId && editValue.trim()) {
            onRename(editingId, editValue.trim());
        }
        setEditingId(null);
    };

    const handleClose = (tab: Tab) => {
        if (tab.content.trim()) {
            setPendingCloseId(tab.id);
            return;
        }
        onClose(tab.id);
    };

    const confirmClose = () => {
        if (pendingCloseId) {
            onClose(pendingCloseId);
            setPendingCloseId(null);
        }
    };

    const cancelClose = () => {
        setPendingCloseId(null);
    };

    return (
        <div
            className={`flex items-center overflow-x-auto border-b ${borderSubtle} ${surfaceBar} min-h-[42px]`}
        >
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    ref={setTabRef(tab.id)}
                    role="tab"
                    tabIndex={0}
                    aria-selected={tab.id === activeTabId}
                    onClick={() => onSelect(tab.id)}
                    onKeyDown={(e) => {
                        if (
                            e.target === e.currentTarget &&
                            (e.key === 'Enter' || e.key === ' ')
                        ) {
                            e.preventDefault();
                            onSelect(tab.id);
                        }
                    }}
                    className={`group flex items-center gap-1.5 px-4 py-2.5 text-sm cursor-pointer select-none shrink-0 border-r ${borderSubtle} transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${
                        tab.id === activeTabId ? tabActive : tabInactive
                    }`}
                >
                    {editingId === tab.id ? (
                        <input
                            ref={inputRef}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit();
                                if (e.key === 'Escape') setEditingId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-28 bg-transparent border-b border-accent outline-none text-sm text-ink"
                        />
                    ) : (
                        <span
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                startEdit(tab);
                            }}
                            className="max-w-[120px] truncate"
                        >
                            {tab.name}
                        </span>
                    )}
                    <button
                        aria-label="close tab"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose(tab);
                        }}
                        className={`ml-0.5 rounded-md hover:bg-ink-border/50 dark:hover:bg-ink-800 w-5 h-5 flex items-center justify-center text-sm leading-none text-ink-muted hover:text-ink ${
                            tab.id === activeTabId
                                ? 'opacity-100'
                                : 'opacity-0 group-hover:opacity-100'
                        }`}
                    >
                        ×
                    </button>
                </div>
            ))}
            <button
                aria-label="add tab"
                onClick={onAdd}
                className="px-4 py-2.5 text-ink-faint hover:text-accent hover:bg-accent-muted transition-colors text-xl leading-none font-light"
            >
                +
            </button>
            <ConfirmModal
                isOpen={pendingCloseId !== null}
                title="Close tab?"
                message="This tab has content. Are you sure you want to close it?"
                onConfirm={confirmClose}
                onCancel={cancelClose}
            />
        </div>
    );
};

export default TabBar;
