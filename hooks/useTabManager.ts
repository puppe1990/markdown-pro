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

const readCounterFromId = (id: string) => {
    const match = /^tab-(\d+)$/.exec(id);
    return match ? Number(match[1]) : 0;
};

const syncCounterWithTabs = (tabs: Tab[]) => {
    const highestStoredId = tabs.reduce((highestId, tab) => {
        return Math.max(highestId, readCounterFromId(tab.id));
    }, 0);

    counter = Math.max(counter, highestStoredId);
};

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
            if (tabs.length > 0) {
                syncCounterWithTabs(tabs);
                return tabs;
            }
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

interface TabState {
    tabs: Tab[];
    activeTabId: string;
}

export function useTabManager() {
    const [tabState, setTabState] = useState<TabState>(() => {
        const tabs = readStoredTabs();
        return {
            tabs,
            activeTabId: readStoredActiveTabId(tabs),
        };
    });
    const { tabs, activeTabId } = tabState;

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
        const id = newId();

        setTabState((prev) => {
            const count = prev.tabs.length + 1;
            const name = count === 1 ? 'Untitled' : `Untitled ${count}`;
            return {
                tabs: [...prev.tabs, { id, name, content: '' }],
                activeTabId: id,
            };
        });
    }, []);

    const closeTab = useCallback((id: string) => {
        setTabState((prev) => {
            if (prev.tabs.length === 1) return prev;
            const idx = prev.tabs.findIndex((tab) => tab.id === id);
            if (idx === -1) return prev;

            const nextTabs = prev.tabs.filter((tab) => tab.id !== id);
            const nextActiveTabId =
                prev.activeTabId === id
                    ? (nextTabs[Math.max(0, idx - 1)]?.id ??
                      nextTabs[0]?.id ??
                      '')
                    : prev.activeTabId;

            return {
                tabs: nextTabs,
                activeTabId: nextActiveTabId,
            };
        });
    }, []);

    const setActiveTabId = useCallback((id: string) => {
        setTabState((prev) => ({
            ...prev,
            activeTabId: prev.tabs.some((tab) => tab.id === id)
                ? id
                : (prev.tabs[0]?.id ?? ''),
        }));
    }, []);

    const renameTab = useCallback((id: string, name: string) => {
        setTabState((prev) => ({
            ...prev,
            tabs: prev.tabs.map((tab) =>
                tab.id === id ? { ...tab, name } : tab,
            ),
        }));
    }, []);

    const updateTabContent = useCallback((id: string, content: string) => {
        setTabState((prev) => ({
            ...prev,
            tabs: prev.tabs.map((tab) =>
                tab.id === id ? { ...tab, content } : tab,
            ),
        }));
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
