import { useState, useCallback, useEffect, useRef } from 'react';
import {
    useTabs,
    useCreateTab,
    useUpdateTab,
    useDeleteTab,
} from '@/src/features/tabs/useTabs';
import { useQueryClient } from '@tanstack/react-query';

export interface Tab {
    id: string;
    name: string;
    content: string;
}

let counter = 0;
const newId = () => {
    const id = `tab-${Date.now()}-${++counter}`;
    return id;
};

const defaultTab = (): Tab => ({ id: newId(), name: 'Untitled', content: '' });

export function useTabManager() {
    const qc = useQueryClient();
    const { data: remoteTabs, isLoading } = useTabs();
    const createTabMut = useCreateTab();
    const updateTabMut = useUpdateTab();
    const deleteTabMut = useDeleteTab();
    const ensuredDefaultTab = useRef(false);
    const addingTabRef = useRef<string | null>(null);

    const [localTabs, setLocalTabs] = useState<Tab[]>(() => {
        if (typeof window === 'undefined') return [defaultTab()];
        try {
            const stored = localStorage.getItem('markdown-tabs');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0)
                    return parsed as Tab[];
            }
        } catch {
            /* ignore */
        }
        return [defaultTab()];
    });

    const [activeTabId, setActiveTabIdState] = useState(() => {
        if (typeof window === 'undefined') return localTabs[0]?.id ?? '';
        const stored = localStorage.getItem('markdown-active-tab-id');
        return stored || (localTabs[0]?.id ?? '');
    });

    const tabs = remoteTabs === undefined ? localTabs : remoteTabs;

    useEffect(() => {
        if (isLoading || remoteTabs === undefined) return;

        if (remoteTabs.length === 0) {
            if (!ensuredDefaultTab.current) {
                ensuredDefaultTab.current = true;
                const id = newId();
                createTabMut.mutate({ data: { id, name: 'Untitled' } });
                setActiveTabIdState(id);
            }
            return;
        }

        if (
            addingTabRef.current &&
            remoteTabs.some((t) => t.id === addingTabRef.current)
        ) {
            addingTabRef.current = null;
        }

        setActiveTabIdState((prev) => {
            if (addingTabRef.current === prev) {
                return prev;
            }
            addingTabRef.current = null;
            return remoteTabs.some((t) => t.id === prev)
                ? prev
                : remoteTabs[0].id;
        });
    }, [remoteTabs, isLoading, createTabMut]);

    const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

    const setActiveTabId = useCallback(
        (id: string) => {
            addingTabRef.current = null;
            setActiveTabIdState(
                tabs.some((t) => t.id === id) ? id : (tabs[0]?.id ?? ''),
            );
        },
        [tabs],
    );

    const addTab = useCallback(() => {
        const id = newId();
        const name =
            tabs.length === 0 ? 'Untitled' : `Untitled ${tabs.length + 1}`;
        addingTabRef.current = id;
        if (remoteTabs === undefined) {
            const newTab: Tab = { id, name, content: '' };
            setLocalTabs((prev) => [...prev, newTab]);
        }
        setActiveTabIdState(id);
        createTabMut.mutate({ data: { id, name } });
    }, [tabs.length, createTabMut, remoteTabs]);

    const closeTab = useCallback(
        (id: string) => {
            if (tabs.length === 1) return;
            if (remoteTabs === undefined) {
                setLocalTabs((prev) => prev.filter((t) => t.id !== id));
            }
            deleteTabMut.mutate({ data: { id } });
            if (addingTabRef.current === id) {
                addingTabRef.current = null;
            }
            setActiveTabIdState((prevActive) => {
                if (prevActive !== id) return prevActive;
                const remaining = tabs.filter((t) => t.id !== id);
                return remaining[0]?.id ?? '';
            });
        },
        [tabs, deleteTabMut, remoteTabs],
    );

    const renameTab = useCallback(
        (id: string, name: string) => {
            if (remoteTabs === undefined) {
                setLocalTabs((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, name } : t)),
                );
            }
            updateTabMut.mutate({ data: { id, name } });
        },
        [updateTabMut, remoteTabs],
    );

    const updateTabContent = useCallback(
        (id: string, content: string) => {
            if (remoteTabs === undefined) {
                setLocalTabs((prev) =>
                    prev.map((t) => (t.id === id ? { ...t, content } : t)),
                );
            }
            updateTabMut.mutate({ data: { id, content } });
        },
        [updateTabMut, remoteTabs],
    );

    const updateTabContentLocal = useCallback(
        (id: string, content: string) => {
            qc.setQueryData<Tab[]>(['tabs'], (old) =>
                old?.map((t) => (t.id === id ? { ...t, content } : t)),
            );
            setLocalTabs((prev) =>
                prev.map((t) => (t.id === id ? { ...t, content } : t)),
            );
        },
        [qc],
    );

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
        updateTabContentLocal,
    };
}
