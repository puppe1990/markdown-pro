import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCreateTab } from './useTabs';

vi.mock('./tabs.functions', () => ({
    createTab: vi
        .fn()
        .mockResolvedValue({ id: 'new-tab', name: 'Test', content: '' }),
}));

function createWrapper() {
    const qc = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return {
        qc,
        Wrapper: ({ children }: { children: React.ReactNode }) =>
            React.createElement(QueryClientProvider, { client: qc }, children),
    };
}

describe('useCreateTab', () => {
    it('optimistically adds tab to cache before server responds', async () => {
        const { qc, Wrapper } = createWrapper();
        qc.setQueryData(
            ['tabs'],
            [{ id: 'existing', name: 'Existing', content: '' }],
        );

        const { result } = renderHook(() => useCreateTab(), {
            wrapper: Wrapper,
        });

        result.current.mutate({ data: { id: 'new-tab', name: 'Test' } });

        await waitFor(() => {
            const cached = qc.getQueryData(['tabs']) as Array<{
                id: string;
                name: string;
                content: string;
            }>;
            expect(cached).toHaveLength(2);
            expect(cached?.[1]).toEqual({
                id: 'new-tab',
                name: 'Test',
                content: '',
            });
        });
    });

    it('adds tab to empty cache', async () => {
        const { qc, Wrapper } = createWrapper();

        const { result } = renderHook(() => useCreateTab(), {
            wrapper: Wrapper,
        });

        result.current.mutate({ data: { id: 'only-tab', name: 'Solo' } });

        await waitFor(() => {
            const cached = qc.getQueryData(['tabs']) as Array<{
                id: string;
                name: string;
                content: string;
            }>;
            expect(cached).toHaveLength(1);
            expect(cached?.[0]).toEqual({
                id: 'only-tab',
                name: 'Solo',
                content: '',
            });
        });
    });

    it('rolls back cache on error', async () => {
        const { createTab } = await import('./tabs.functions');
        vi.mocked(createTab).mockRejectedValueOnce(new Error('network'));

        const { qc, Wrapper } = createWrapper();
        qc.setQueryData(
            ['tabs'],
            [{ id: 'existing', name: 'Existing', content: '' }],
        );

        const { result } = renderHook(() => useCreateTab(), {
            wrapper: Wrapper,
        });

        result.current.mutate({ data: { id: 'new-tab', name: 'Test' } });

        await waitFor(() => {
            const cached = qc.getQueryData(['tabs']) as Array<{
                id: string;
                name: string;
                content: string;
            }>;
            expect(cached).toHaveLength(1);
            expect(cached?.[0]).toEqual({
                id: 'existing',
                name: 'Existing',
                content: '',
            });
        });
    });
});
