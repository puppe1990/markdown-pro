import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/src/test/create-query-wrapper';
import type { Tab } from '@/src/features/tabs/tabs.functions';

const mockGetTabs = vi.fn<() => Promise<Tab[]>>();
const mockCreateTab =
    vi.fn<(vars: { data: { id: string; name?: string } }) => Promise<Tab>>();
const mockUpdateTab = vi.fn();
const mockDeleteTab = vi.fn();

vi.mock('@/src/features/tabs/tabs.functions', () => ({
    getTabs: () => mockGetTabs(),
    createTab: (vars: { data: { id: string; name?: string } }) =>
        mockCreateTab(vars),
    updateTab: (...args: unknown[]) => mockUpdateTab(...args),
    deleteTab: (...args: unknown[]) => mockDeleteTab(...args),
}));

import { useTabManager } from './useTabManager';

describe('useTabManager typing regression', () => {
    beforeEach(() => {
        localStorage.clear();
        mockGetTabs.mockReset();
        mockCreateTab.mockReset();
        mockUpdateTab.mockReset();
        mockDeleteTab.mockReset();
    });

    it('keeps typed content when remote tabs finish loading after user starts writing', async () => {
        let resolveGetTabs!: (tabs: Tab[]) => void;
        mockGetTabs.mockImplementation(
            () =>
                new Promise<Tab[]>((resolve) => {
                    resolveGetTabs = resolve;
                }),
        );

        const { Wrapper } = createQueryWrapper();
        const { result } = renderHook(() => useTabManager(), {
            wrapper: Wrapper,
        });

        const tabId = result.current.activeTabId;

        act(() => {
            result.current.updateTabContentLocal(tabId, '# typing before sync');
        });

        expect(result.current.activeTab.content).toBe('# typing before sync');

        await act(async () => {
            resolveGetTabs([{ id: tabId, name: 'Untitled', content: '' }]);
        });

        await waitFor(() => {
            expect(result.current.activeTab.content).toBe(
                '# typing before sync',
            );
        });
    });

    it('keeps typed content on a new tab when createTab settles and tabs refetch', async () => {
        mockGetTabs.mockResolvedValue([
            { id: 'existing', name: 'Saved', content: '# Note' },
        ]);

        const { Wrapper } = createQueryWrapper();
        const { result } = renderHook(() => useTabManager(), {
            wrapper: Wrapper,
        });

        await waitFor(() => {
            expect(result.current.tabs).toHaveLength(1);
        });

        let resolveCreate!: (tab: Tab) => void;
        mockCreateTab.mockImplementation(
            () =>
                new Promise<Tab>((resolve) => {
                    resolveCreate = resolve;
                }),
        );

        await act(async () => {
            result.current.addTab();
        });

        await waitFor(() => {
            expect(mockCreateTab).toHaveBeenCalled();
        });

        const newTabId = result.current.activeTabId;

        act(() => {
            result.current.updateTabContentLocal(newTabId, '# fresh draft');
        });

        expect(result.current.activeTabId).toBe(newTabId);
        expect(result.current.activeTab.content).toBe('# fresh draft');

        await act(async () => {
            resolveCreate({
                id: newTabId,
                name: 'Untitled 2',
                content: '',
            });
            mockGetTabs.mockResolvedValue([
                { id: 'existing', name: 'Saved', content: '# Note' },
                { id: newTabId, name: 'Untitled 2', content: '' },
            ]);
        });

        await waitFor(() => {
            expect(result.current.activeTabId).toBe(newTabId);
            expect(result.current.activeTab.content).toBe('# fresh draft');
        });
    });

    it('keeps typed content on an existing tab when updateTab refetch returns stale empty content', async () => {
        let resolveUpdate!: (tab: Tab) => void;
        mockUpdateTab.mockImplementation(
            () =>
                new Promise<Tab>((resolve) => {
                    resolveUpdate = resolve;
                }),
        );
        mockGetTabs.mockResolvedValue([
            { id: 'server-tab', name: 'Notes', content: '' },
        ]);

        const { Wrapper } = createQueryWrapper();
        const { result } = renderHook(() => useTabManager(), {
            wrapper: Wrapper,
        });

        await waitFor(() => {
            expect(result.current.tabs[0]?.id).toBe('server-tab');
        });

        act(() => {
            result.current.updateTabContentLocal('server-tab', '# edited live');
        });

        expect(result.current.activeTab.content).toBe('# edited live');

        act(() => {
            result.current.updateTabContent('server-tab', '# edited live');
        });

        await waitFor(() => {
            expect(mockUpdateTab).toHaveBeenCalled();
        });

        await act(async () => {
            resolveUpdate({
                id: 'server-tab',
                name: 'Notes',
                content: '# edited live',
            });
            mockGetTabs.mockResolvedValue([
                { id: 'server-tab', name: 'Notes', content: '' },
            ]);
        });

        await waitFor(() => {
            expect(result.current.activeTab.content).toBe('# edited live');
        });
    });
});
