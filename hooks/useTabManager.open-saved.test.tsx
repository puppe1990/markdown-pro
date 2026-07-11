import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { SavedTab } from '@/src/features/tabs/tabs.functions';

const { mockOpenTab, mockUseTabs, mockUseAllTabs } = vi.hoisted(() => ({
    mockOpenTab: vi.fn(),
    mockUseTabs: vi.fn(),
    mockUseAllTabs: vi.fn(),
}));

const closedDoc: SavedTab = {
    id: 'closed-tab',
    name: 'My Draft',
    content: '# Hello',
    isOpen: false,
    updatedAt: '2026-06-01',
};

vi.mock('@/src/features/tabs/useTabs', () => ({
    useTabs: () => mockUseTabs(),
    useAllTabs: () => mockUseAllTabs(),
    useCreateTab: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
    useUpdateTab: () => ({ mutate: vi.fn(), mutateAsync: vi.fn() }),
    useHideTab: () => ({ mutate: vi.fn() }),
    useDeleteTab: () => ({ mutate: vi.fn() }),
    useOpenTab: () => ({ mutate: mockOpenTab }),
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

describe('useTabManager openSavedDocument', () => {
    beforeEach(() => {
        localStorage.clear();
        mockOpenTab.mockClear();
        mockUseTabs.mockReturnValue({
            data: [{ id: 'open-tab', name: 'Open', content: '' }],
            isLoading: false,
        });
        mockUseAllTabs.mockReturnValue({
            data: [closedDoc],
            isLoading: false,
        });
    });

    it('activates the reopened tab immediately and calls openTab', () => {
        const { result } = renderHook(() => useTabManager(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.openSavedDocument('closed-tab');
        });

        expect(result.current.activeTabId).toBe('closed-tab');
        expect(mockOpenTab).toHaveBeenCalledWith({
            data: { id: 'closed-tab' },
        });
    });

    it('calls openTab when allTabs still marks the tab as open after close', () => {
        mockUseTabs.mockReturnValue({
            data: [{ id: 'open-tab', name: 'Open', content: '' }],
            isLoading: false,
        });
        mockUseAllTabs.mockReturnValue({
            data: [{ ...closedDoc, isOpen: true }],
            isLoading: false,
        });

        const { result } = renderHook(() => useTabManager(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.openSavedDocument('closed-tab');
        });

        expect(result.current.activeTabId).toBe('closed-tab');
        expect(mockOpenTab).toHaveBeenCalledWith({
            data: { id: 'closed-tab' },
        });
    });
});
