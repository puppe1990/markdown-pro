import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTabManager } from './useTabManager';

const mockHideTab = vi.fn();

vi.mock('@/src/features/tabs/useTabs', () => ({
    useTabs: () => ({ data: undefined, isLoading: false }),
    useAllTabs: () => ({ data: undefined, isLoading: false }),
    useCreateTab: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
    useUpdateTab: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
    useHideTab: () => ({ mutate: mockHideTab }),
    useDeleteTab: () => ({ mutate: vi.fn() }),
}));

function createWrapper() {
    const qc = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );
}

describe('useTabManager soft-close', () => {
    beforeEach(() => {
        localStorage.clear();
        mockHideTab.mockClear();
    });

    it('calls hideTab instead of deleting when closing a tab', () => {
        const { result } = renderHook(() => useTabManager(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.addTab();
        });

        const firstId = result.current.tabs[0].id;

        act(() => {
            result.current.closeTab(firstId);
        });

        expect(mockHideTab).toHaveBeenCalledWith({ data: { id: firstId } });
    });

    it('can close the last open tab', () => {
        const { result } = renderHook(() => useTabManager(), {
            wrapper: createWrapper(),
        });

        const onlyId = result.current.tabs[0].id;

        act(() => {
            result.current.closeTab(onlyId);
        });

        expect(mockHideTab).toHaveBeenCalledWith({ data: { id: onlyId } });
        expect(result.current.tabs).toHaveLength(0);
    });
});
