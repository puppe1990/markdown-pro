import { useState, useCallback, useEffect } from 'react';

export interface Tab {
    id: string;
    name: string;
    content: string;
}

let counter = 0;
const newId = () => `tab-${++counter}`;

const defaultTab = (): Tab => ({ id: newId(), name: 'Untitled', content: '' });
const TABS_STORAGE_KEY = 'markdown-tabs';
const ACTIVE_TAB_STORAGE_KEY = 'markdown-active-tab-id';
const LEGACY_TABS_STORAGE_KEY = 'markdown-content';

const isTab = (value: unknown): value is Tab => {
    if (typeof value !== 'object' || value === null) return false;

    const candidate = value as Partial<Tab>;

    return (
        typeof candidate.id === 'string' &&
        typeof candidate.name === 'string' &&
        typeof candidate.content === 'string'
    );
};

const readStoredTabs = (): Tab[] => {
    const storedTabs =
        localStorage.getItem(TABS_STORAGE_KEY) ??
        localStorage.getItem(LEGACY_TABS_STORAGE_KEY);

    if (!storedTabs) return [defaultTab()];

    try {
        const parsed = JSON.parse(storedTabs);
        if (Array.isArray(parsed)) {
            const tabs = parsed.filter(isTab);
            if (tabs.length > 0) return tabs;
        }
    } catch {
        // Ignore corrupted persisted state and fall back to a new tab.
    }

    return [defaultTab()];
};

const readStoredActiveTabId = (tabs: Tab[]) => {
    const storedActiveTabId = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);

    if (storedActiveTabId && tabs.some((tab) => tab.id === storedActiveTabId)) {
        return storedActiveTabId;
    }

    return tabs[0]?.id ?? '';
};

export function useTabManager() {
    const [initialState] = useState(() => {
        const tabs = readStoredTabs();
        return {
            tabs,
            activeTabId: readStoredActiveTabId(tabs),
        };
    });
    const [tabs, setTabs] = useState<Tab[]>(initialState.tabs);
    const [activeTabId, setActiveTabId] = useState<string>(
        initialState.activeTabId,
    );

    const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

    useEffect(() => {
        localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
    }, [tabs]);

    useEffect(() => {
        if (activeTabId) {
            localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTabId);
        }
    }, [activeTabId]);

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
