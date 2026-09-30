import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'markdown-tabs';
const LOCAL_DEBOUNCE_MS = 150;
const AUTO_RETRY_DELAY_MS = 3000;
const MAX_SYNC_FAILURES = 3;

export type SyncStatus = 'saved' | 'pending' | 'saving' | 'retrying' | 'error';

export function useDebouncedSync(
    activeTabId: string,
    content: string,
    onSync: (id: string, content: string) => Promise<void>,
    delay = 10000,
) {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('saved');
    const [retrySequence, setRetrySequence] = useState(0);
    const onSyncRef = useRef(onSync);
    const syncInProgressRef = useRef(false);
    const syncFailureCountRef = useRef(0);
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
                syncFailureCountRef.current = 0;
                // If the user kept typing while this sync was in flight, stay
                // pending so the debounce re-syncs the newer content instead of
                // reporting "saved" and cancelling the scheduled sync.
                setSyncStatus(
                    contentRef.current === syncContent ? 'saved' : 'pending',
                );
            } catch {
                syncFailureCountRef.current += 1;
                if (syncFailureCountRef.current < MAX_SYNC_FAILURES) {
                    setSyncStatus('retrying');
                    setRetrySequence((sequence) => sequence + 1);
                } else {
                    setSyncStatus('error');
                }
            } finally {
                syncInProgressRef.current = false;
            }
        },
        [],
    );

    useEffect(() => {
        const localTimer = setTimeout(() => {
            syncFailureCountRef.current = 0;
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

    const syncLatest = useCallback(
        async (resetFailures: boolean) => {
            if (syncInProgressRef.current) return;
            if (resetFailures) syncFailureCountRef.current = 0;

            const tabId = activeTabIdRef.current;
            saveToLocalStorage(contentRef.current);

            const tabs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const tab = tabs.find((t: { id: string }) => t.id === tabId);
            if (!tab) return;
            await performSync(tabId, tab.content);
        },
        [saveToLocalStorage, performSync],
    );

    useEffect(() => {
        if (syncStatus !== 'retrying') return;

        const retryTimer = setTimeout(() => {
            void syncLatest(false);
        }, AUTO_RETRY_DELAY_MS);

        return () => clearTimeout(retryTimer);
    }, [retrySequence, syncLatest, syncStatus]);

    const syncNow = useCallback(async () => {
        if (syncInProgressRef.current) return;
        await syncLatest(true);
    }, [syncLatest]);

    return { syncStatus, syncNow };
}
