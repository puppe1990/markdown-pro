import { useState, useCallback } from 'react';

export interface Tab {
    id: string;
    name: string;
    content: string;
}

let counter = 0;
const newId = () => `tab-${++counter}`;

const defaultTab = (): Tab => ({ id: newId(), name: 'Untitled', content: '' });

export function useTabManager() {
    const [tabs, setTabs] = useState<Tab[]>(() => [defaultTab()]);
    const [activeTabId, setActiveTabId] = useState<string>(
        () => tabs[0]?.id ?? '',
    );

    const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

    const addTab = useCallback(() => {
        setTabs((prev) => {
            const count = prev.length + 1;
            const name = count === 1 ? 'Untitled' : `Untitled ${count}`;
            const tab: Tab = { id: newId(), name, content: '' };
            setActiveTabId(tab.id);
            return [...prev, tab];
        });
    }, []);

    const closeTab = useCallback((id: string) => {
        setTabs((prev) => {
            if (prev.length === 1) return prev;
            const idx = prev.findIndex((t) => t.id === id);
            const next = prev.filter((t) => t.id !== id);
            setActiveTabId(next[Math.max(0, idx - 1)].id);
            return next;
        });
    }, []);

    const renameTab = useCallback((id: string, name: string) => {
        setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
    }, []);

    const updateTabContent = useCallback((id: string, content: string) => {
        setTabs((prev) =>
            prev.map((t) => (t.id === id ? { ...t, content } : t)),
        );
    }, []);

    return {
        tabs,
        activeTabId,
        activeTab,
        setActiveTabId,
        addTab,
        closeTab,
        renameTab,
        updateTabContent,
    };
}
