import { useState, useCallback } from 'react';
import { useTabs, useCreateTab, useUpdateTab, useDeleteTab } from '@/src/features/tabs/useTabs';

export interface Tab {
    id: string;
    name: string;
    content: string;
}

let counter = 0;
const newId = () => `tab-${Date.now()}-${++counter}`;

const defaultTab = (): Tab => ({ id: newId(), name: 'Untitled', content: '' });

export function useTabManager() {
    const { data: remoteTabs, isLoading } = useTabs();
    const createTabMut = useCreateTab();
    const updateTabMut = useUpdateTab();
    const deleteTabMut = useDeleteTab();

    const [localTabs, setLocalTabs] = useState<Tab[]>(() => {
        if (typeof window === 'undefined') return [defaultTab()];
        try {
            const stored = localStorage.getItem('markdown-tabs');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed as Tab[];
            }
        } catch { /* ignore */ }
        return [defaultTab()];
    });

    const [activeTabId, setActiveTabIdState] = useState(() => {
        if (typeof window === 'undefined') return localTabs[0]?.id ?? '';
        const stored = localStorage.getItem('markdown-active-tab-id');
        return stored || (localTabs[0]?.id ?? '');
    });

    const tabs = remoteTabs && remoteTabs.length > 0 ? remoteTabs : localTabs;

    const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

    const setActiveTabId = useCallback((id: string) => {
        setActiveTabIdState(tabs.some((t) => t.id === id) ? id : (tabs[0]?.id ?? ''));
    }, [tabs]);

    const addTab = useCallback(() => {
        const id = newId();
        const name = tabs.length === 0 ? 'Untitled' : `Untitled ${tabs.length + 1}`;
        const newTab: Tab = { id, name, content: '' };
        setLocalTabs((prev) => [...prev, newTab]);
        setActiveTabIdState(id);
        createTabMut.mutate({ data: { id, name } });
    }, [tabs.length, createTabMut]);

    const closeTab = useCallback((id: string) => {
        if (tabs.length === 1) return;
        setLocalTabs((prev) => prev.filter((t) => t.id !== id));
        deleteTabMut.mutate({ data: { id } });
        setActiveTabIdState((prevActive) => {
            if (prevActive !== id) return prevActive;
            const remaining = tabs.filter((t) => t.id !== id);
            return remaining[0]?.id ?? '';
        });
    }, [tabs, deleteTabMut]);

    const renameTab = useCallback((id: string, name: string) => {
        setLocalTabs((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
        updateTabMut.mutate({ data: { id, name } });
    }, [updateTabMut]);

    const updateTabContent = useCallback((id: string, content: string) => {
        setLocalTabs((prev) => prev.map((t) => (t.id === id ? { ...t, content } : t)));
        updateTabMut.mutate({ data: { id, content } });
    }, [updateTabMut]);

    return {
        tabs,
        activeTabId,
        activeTab,
        isLoading,
        setActiveTabId,
        addTab,
        closeTab,
        renameTab,
        updateTabContent,
    };
}
