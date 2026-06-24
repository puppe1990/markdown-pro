import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTabManager } from './useTabManager';

const mockHideTab = vi.fn();
const mockDeleteTab = vi.fn();

vi.mock('@/src/features/tabs/useTabs', () => ({
    useTabs: () => ({ data: undefined, isLoading: false }),
    useAllTabs: () => ({ data: undefined, isLoading: false }),
    useCreateTab: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
    useUpdateTab: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
    useHideTab: () => ({ mutate: mockHideTab }),
    useDeleteTab: () => ({ mutate: mockDeleteTab }),
}));

function createWrapper() {
    const qc = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );
}

describe('useTabManager savable close', () => {
    beforeEach(() => {
        localStorage.clear();
        mockHideTab.mockClear();
        mockDeleteTab.mockClear();
    });

    it('deletes empty Untitled tabs on close', () => {
        const { result } = renderHook(() => useTabManager(), {
            wrapper: createWrapper(),
        });

        const id = result.current.tabs[0].id;

        act(() => {
            result.current.closeTab(id);
        });

        expect(mockDeleteTab).toHaveBeenCalledWith({ data: { id } });
        expect(mockHideTab).not.toHaveBeenCalled();
    });

    it('hides tabs that have content', () => {
        const { result } = renderHook(() => useTabManager(), {
            wrapper: createWrapper(),
        });

        const id = result.current.tabs[0].id;

        act(() => {
            result.current.updateTabContentLocal(id, '# Draft');
        });
        act(() => {
            result.current.closeTab(id);
        });

        expect(mockHideTab).toHaveBeenCalledWith({ data: { id } });
        expect(mockDeleteTab).not.toHaveBeenCalled();
    });

    it('hides tabs with a customized name even when empty', () => {
        const { result } = renderHook(() => useTabManager(), {
            wrapper: createWrapper(),
        });

        const id = result.current.tabs[0].id;

        act(() => {
            result.current.renameTab(id, 'Ideas');
        });
        act(() => {
            result.current.closeTab(id);
        });

        expect(mockHideTab).toHaveBeenCalledWith({ data: { id } });
        expect(mockDeleteTab).not.toHaveBeenCalled();
    });
});
