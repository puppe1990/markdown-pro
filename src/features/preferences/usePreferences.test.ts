import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSetTheme } from './usePreferences';

vi.mock('./preferences.functions', () => ({
    getPreferences: vi.fn().mockResolvedValue({ theme: 'light' }),
    setTheme: vi.fn().mockResolvedValue({ theme: 'dark' }),
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

describe('useSetTheme', () => {
    it('optimistically updates cache with correct theme value', async () => {
        const { qc, Wrapper } = createWrapper();
        qc.setQueryData(['preferences'], { theme: 'light' });

        const { result } = renderHook(() => useSetTheme(), {
            wrapper: Wrapper,
        });

        result.current.mutate({ data: { theme: 'dark' } });

        await waitFor(() => {
            const cached = qc.getQueryData(['preferences']);
            expect(cached).toEqual({ theme: 'dark' });
        });
    });

    it('rolls back cache on error', async () => {
        const { setTheme } = await import('./preferences.functions');
        vi.mocked(setTheme).mockRejectedValueOnce(new Error('network'));

        const { qc, Wrapper } = createWrapper();
        qc.setQueryData(['preferences'], { theme: 'light' });

        const { result } = renderHook(() => useSetTheme(), {
            wrapper: Wrapper,
        });

        result.current.mutate({ data: { theme: 'dark' } });

        await waitFor(() => {
            const cached = qc.getQueryData(['preferences']);
            expect(cached).toEqual({ theme: 'light' });
        });
    });
});
