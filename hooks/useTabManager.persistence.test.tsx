import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Tab } from '@/src/features/tabs/tabs.functions';

const mockCreateTab = vi.fn();
const mockUpdateTab = vi.fn();
const mockDeleteTab = vi.fn();

let remoteTabsState: { data: Tab[] | undefined; isLoading: boolean } = {
    data: undefined,
    isLoading: true,
};

vi.mock('@/src/features/tabs/useTabs', () => ({
    useTabs: () => remoteTabsState,
    useCreateTab: () => ({ mutate: mockCreateTab, mutateAsync: vi.fn() }),
    useUpdateTab: () => ({ mutate: mockUpdateTab, mutateAsync: vi.fn() }),
    useDeleteTab: () => ({ mutate: mockDeleteTab, mutateAsync: vi.fn() }),
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
        mockDeleteTab.mockReset();
        remoteTabsState = { data: undefined, isLoading: true };
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
});
