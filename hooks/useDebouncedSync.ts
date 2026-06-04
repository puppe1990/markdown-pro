import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'markdown-tabs';
const LOCAL_DEBOUNCE_MS = 150;

export type SyncStatus = 'saved' | 'pending' | 'saving' | 'error';

export function useDebouncedSync(
    activeTabId: string,
    content: string,
    onSync: (id: string, content: string) => Promise<void>,
    delay = 10000,
) {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('saved');
    const onSyncRef = useRef(onSync);
    const syncInProgressRef = useRef(false);
    const activeTabIdRef = useRef(activeTabId);
    const contentRef = useRef(content);

    useEffect(() => {
        onSyncRef.current = onSync;
    }, [onSync]);

    useEffect(() => {
        activeTabIdRef.current = activeTabId;
    }, [activeTabId]);

    useEffect(() => {
        contentRef.current = content;
    }, [content]);

    const saveToLocalStorage = useCallback((value: string) => {
        const tabId = activeTabIdRef.current;
        const tabs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const existingIndex = tabs.findIndex(
            (t: { id: string }) => t.id === tabId,
        );
        if (existingIndex >= 0) {
            tabs[existingIndex].content = value;
        } else {
            tabs.push({ id: tabId, content: value });
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    }, []);

    const performSync = useCallback(
        async (tabId: string, syncContent: string) => {
            syncInProgressRef.current = true;
            setSyncStatus('saving');
            try {
                await onSyncRef.current(tabId, syncContent);
                setSyncStatus('saved');
            } catch {
                setSyncStatus('error');
            } finally {
                syncInProgressRef.current = false;
            }
        },
        [],
    );

    useEffect(() => {
        const localTimer = setTimeout(() => {
            saveToLocalStorage(content);
            setSyncStatus('pending');
        }, LOCAL_DEBOUNCE_MS);

        return () => {
            clearTimeout(localTimer);
        };
    }, [content, saveToLocalStorage]);

    useEffect(() => {
        if (syncStatus !== 'pending') return;

        const syncingTabId = activeTabId;

        const syncTimer = setTimeout(() => {
            const tabs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const tab = tabs.find((t: { id: string }) => t.id === syncingTabId);
            if (!tab) return;
            performSync(syncingTabId, tab.content);
        }, delay);

        return () => {
            clearTimeout(syncTimer);
        };
    }, [content, delay, syncStatus, performSync, activeTabId]);

    const prevActiveTabRef = useRef(activeTabId);

    useEffect(() => {
        const prevTabId = prevActiveTabRef.current;
        prevActiveTabRef.current = activeTabId;

        if (prevTabId === activeTabId) return;

        const tabs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const tab = tabs.find((t: { id: string }) => t.id === prevTabId);
        if (tab) {
            onSyncRef.current(prevTabId, tab.content);
        }
    }, [activeTabId]);

    const syncNow = useCallback(async () => {
        if (syncInProgressRef.current) return;

        const tabId = activeTabIdRef.current;
        saveToLocalStorage(contentRef.current);

        const tabs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const tab = tabs.find((t: { id: string }) => t.id === tabId);
        if (!tab) return;
        await performSync(tabId, tab.content);
    }, [saveToLocalStorage, performSync]);

    return { syncStatus, syncNow };
}
