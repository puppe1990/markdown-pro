import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Tab } from '@/src/features/tabs/tabs.functions';

const mockCreateTab = vi.fn();
const mockUpdateTab = vi.fn();
const mockHideTab = vi.fn();

type CreateVars = { data: { id: string; name?: string } };

type MutResult = {
    mutate: (vars: CreateVars) => void;
    mutateAsync: ReturnType<typeof vi.fn>;
    isPending: boolean;
    variables: CreateVars | undefined;
};

let remoteTabsState: { data: Tab[] | undefined; isLoading: boolean } = {
    data: undefined,
    isLoading: true,
};

let createMutState: { isPending: boolean; variables: CreateVars | undefined } =
    {
        isPending: false,
        variables: undefined,
    };

function makeCreateMut(): MutResult {
    return {
        mutate: (vars: CreateVars) => {
            createMutState.isPending = true;
            createMutState.variables = vars;
            mockCreateTab(vars);
            // note: in real, onMutate etc would run sync; here we let test control settle
        },
        mutateAsync: vi.fn(),
        get isPending() {
            return createMutState.isPending;
        },
        get variables() {
            return createMutState.variables;
        },
    };
}

vi.mock('@/src/features/tabs/useTabs', () => ({
    useTabs: () => remoteTabsState,
    useAllTabs: () => ({ data: undefined, isLoading: false }),
    useCreateTab: () => makeCreateMut(),
    useUpdateTab: () => ({ mutate: mockUpdateTab, mutateAsync: vi.fn() }),
    useHideTab: () => ({ mutate: mockHideTab, mutateAsync: vi.fn() }),
    useDeleteTab: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
}));

import { useTabManager } from './useTabManager';

function createWrapper() {
    const qc = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );
}

describe('useTabManager persistence', () => {
    beforeEach(() => {
        localStorage.clear();
        mockCreateTab.mockReset();
        mockUpdateTab.mockReset();
        mockHideTab.mockReset();
        remoteTabsState = { data: undefined, isLoading: true };
        createMutState = { isPending: false, variables: undefined };
    });

    it('shows tab content loaded from the server after login', () => {
        remoteTabsState = {
            data: [
                {
                    id: 'server-tab-1',
                    name: 'Notes',
                    content: '# Saved markdown',
                },
            ],
            isLoading: false,
        };

        const { result } = renderHook(() => useTabManager(), {
            wrapper: createWrapper(),
        });

        expect(result.current.tabs).toEqual([
            { id: 'server-tab-1', name: 'Notes', content: '# Saved markdown' },
        ]);
        expect(result.current.activeTab.content).toBe('# Saved markdown');
    });

    it('does not use local-only tabs when the server returns an empty tab list', () => {
        localStorage.setItem(
            'markdown-tabs',
            JSON.stringify([
                {
                    id: 'local-only',
                    name: 'Draft',
                    content: '# Lost on reload',
                },
            ]),
        );
        remoteTabsState = { data: [], isLoading: false };

        const { result } = renderHook(() => useTabManager(), {
            wrapper: createWrapper(),
        });

        expect(result.current.tabs).toEqual([]);
        expect(
            result.current.tabs.some(
                (tab) => tab.content === '# Lost on reload',
            ),
        ).toBe(false);
    });

    it('creates a default tab on the server when the user has no tabs', async () => {
        remoteTabsState = { data: [], isLoading: false };

        renderHook(() => useTabManager(), { wrapper: createWrapper() });

        await waitFor(() => {
            expect(mockCreateTab).toHaveBeenCalledWith({
                data: expect.objectContaining({ name: 'Untitled' }),
            });
        });
    });

    it('persists edited content to the server for tabs loaded from remote', () => {
        remoteTabsState = {
            data: [{ id: 'server-tab-1', name: 'Untitled', content: '' }],
            isLoading: false,
        };

        const { result } = renderHook(() => useTabManager(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.updateTabContent('server-tab-1', '# Hello again');
        });

        expect(mockUpdateTab).toHaveBeenCalledWith({
            data: { id: 'server-tab-1', content: '# Hello again' },
        });
    });

    it('recovers activeTabId to existing tab and clears pending when remote update shows create did not appear (rollback case)', async () => {
        const existing = [{ id: 'srv-1', name: 'Saved', content: '# Note' }];
        remoteTabsState = { data: existing, isLoading: false };

        const { result, rerender } = renderHook(() => useTabManager(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.addTab();
        });

        const pendingId = result.current.activeTabId;
        expect(pendingId).not.toBe('srv-1');

        // Simulate create settled (failed/rolled back) + remote-tabs update:
        // now isPending=false and server data does not contain the tab.
        // The logic must clear adding ref and recover activeTabId.
        act(() => {
            createMutState.isPending = false;
            remoteTabsState = {
                data: [...existing], // new array ref, no pending tab
                isLoading: false,
            };
        });
        rerender();

        await waitFor(() => {
            expect(result.current.activeTabId).toBe('srv-1');
            expect(result.current.activeTabId).not.toBe(pendingId);
        });
    });
});
