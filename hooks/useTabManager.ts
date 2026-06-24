import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
    useTabs,
    useAllTabs,
    useCreateTab,
    useUpdateTab,
    useHideTab,
} from '@/src/features/tabs/useTabs';
import { useQueryClient } from '@tanstack/react-query';
import { buildDisplayTabs } from './tab-display';

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
    const { data: queryTabs, isLoading } = useTabs();
    const { data: allTabs } = useAllTabs();
    const createTabMut = useCreateTab();
    const updateTabMut = useUpdateTab();
    const hideTabMut = useHideTab();
    const ensuredDefaultTab = useRef(false);
    const addingTabRef = useRef<string | null>(null);
    const [pendingContent, setPendingContent] = useState<
        Record<string, string>
    >({});
    const [stagedTabIds, setStagedTabIds] = useState<Set<string>>(
        () => new Set(),
    );

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

    const tabs = useMemo(
        () =>
            buildDisplayTabs(
                queryTabs,
                localTabs,
                pendingContent,
                stagedTabIds,
            ),
        [queryTabs, localTabs, pendingContent, stagedTabIds],
    );

    useEffect(() => {
        if (isLoading || queryTabs === undefined) return;

        if (queryTabs.length === 0) {
            if (!ensuredDefaultTab.current) {
                const hasSavedDocuments = (allTabs?.length ?? 0) > 0;
                if (hasSavedDocuments) {
                    ensuredDefaultTab.current = true;
                    setActiveTabIdState('');
                    return;
                }
                ensuredDefaultTab.current = true;
                const id = newId();
                createTabMut.mutate({ data: { id, name: 'Untitled' } });
                setActiveTabIdState(id);
            }
            return;
        }

        if (addingTabRef.current) {
            const isInRemote = queryTabs.some(
                (t) => t.id === addingTabRef.current,
            );
            if (isInRemote) {
                const stagedId = addingTabRef.current;
                addingTabRef.current = null;
                if (stagedId) {
                    setStagedTabIds((prev) => {
                        const next = new Set(prev);
                        next.delete(stagedId);
                        return next;
                    });
                }
            } else {
                const pendingId = createTabMut.isPending
                    ? (
                          createTabMut.variables as
                              | { data?: { id?: string } }
                              | undefined
                      )?.data?.id
                    : undefined;
                if (pendingId !== addingTabRef.current) {
                    addingTabRef.current = null;
                }
            }
        }

        setActiveTabIdState((prev) => {
            if (addingTabRef.current === prev) {
                return prev;
            }
            addingTabRef.current = null;
            return queryTabs.some((t) => t.id === prev)
                ? prev
                : queryTabs[0].id;
        });
    }, [queryTabs, isLoading, allTabs, createTabMut]);

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
        const newTab: Tab = { id, name, content: '' };
        addingTabRef.current = id;
        setStagedTabIds((prev) => new Set(prev).add(id));
        setLocalTabs((prev) => [...prev, newTab]);
        setActiveTabIdState(id);
        createTabMut.mutate({ data: { id, name } });
    }, [tabs.length, createTabMut]);

    const closeTab = useCallback(
        (id: string) => {
            setLocalTabs((prev) => prev.filter((t) => t.id !== id));
            setPendingContent((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
            setStagedTabIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            hideTabMut.mutate({ data: { id } });
            if (addingTabRef.current === id) {
                addingTabRef.current = null;
            }
            setActiveTabIdState((prevActive) => {
                if (prevActive !== id) return prevActive;
                const remaining = tabs.filter((t) => t.id !== id);
                return remaining[0]?.id ?? '';
            });
        },
        [tabs, hideTabMut],
    );

    const renameTab = useCallback(
        (id: string, name: string) => {
            setLocalTabs((prev) =>
                prev.map((t) => (t.id === id ? { ...t, name } : t)),
            );
            updateTabMut.mutate({ data: { id, name } });
        },
        [updateTabMut],
    );

    const updateTabContent = useCallback(
        (id: string, content: string) => {
            setLocalTabs((prev) =>
                prev.map((t) => (t.id === id ? { ...t, content } : t)),
            );
            updateTabMut.mutate({ data: { id, content } });
        },
        [updateTabMut],
    );

    const updateTabContentLocal = useCallback(
        (id: string, content: string) => {
            setPendingContent((prev) => ({ ...prev, [id]: content }));
            qc.setQueryData<Tab[]>(['tabs'], (old) => {
                const base = old ?? [];
                if (!base.some((tab) => tab.id === id)) {
                    const localTab = localTabs.find((tab) => tab.id === id);
                    return [
                        ...base,
                        {
                            id,
                            name: localTab?.name ?? 'Untitled',
                            content,
                        },
                    ];
                }
                return base.map((tab) =>
                    tab.id === id ? { ...tab, content } : tab,
                );
            });
            setLocalTabs((prev) => {
                if (prev.some((tab) => tab.id === id)) {
                    return prev.map((tab) =>
                        tab.id === id ? { ...tab, content } : tab,
                    );
                }
                const cached = qc
                    .getQueryData<Tab[]>(['tabs'])
                    ?.find((tab) => tab.id === id);
                return [
                    ...prev,
                    {
                        id,
                        name: cached?.name ?? 'Untitled',
                        content,
                    },
                ];
            });
        },
        [qc, localTabs],
    );

    const acknowledgeTabContentSynced = useCallback((id: string) => {
        setPendingContent((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }, []);

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
        acknowledgeTabContentSynced,
    };
}
