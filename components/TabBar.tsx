import React, { useState, useRef, useEffect } from 'react';
import { Tab } from '../hooks/useTabManager';

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
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

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
        if (
            tab.content.trim() &&
            !window.confirm(
                'This tab has content. Are you sure you want to close it?',
            )
        ) {
            return;
        }

        onClose(tab.id);
    };

    return (
        <div className="flex items-center overflow-x-auto border-b border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm min-h-[40px]">
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    onClick={() => onSelect(tab.id)}
                    className={`group flex items-center gap-1 px-3 py-2 text-sm cursor-pointer select-none shrink-0 border-r border-gray-200/60 dark:border-gray-700/60 transition-colors ${
                        tab.id === activeTabId
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 text-blue-600 dark:text-blue-400 border-b-2 border-b-blue-500'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
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
                            className="w-24 bg-transparent border-b border-blue-400 outline-none text-sm"
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
                        className="opacity-0 group-hover:opacity-100 ml-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 w-4 h-4 flex items-center justify-center text-xs leading-none"
                    >
                        ×
                    </button>
                </div>
            ))}
            <button
                aria-label="add tab"
                onClick={onAdd}
                className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg leading-none"
            >
                +
            </button>
        </div>
    );
};

export default TabBar;
