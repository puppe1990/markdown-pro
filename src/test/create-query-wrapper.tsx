import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export interface QueryWrapper {
    qc: QueryClient;
    Wrapper: React.ComponentType<{ children: React.ReactNode }>;
}

/**
 * Creates a fresh QueryClient + wrapper for isolated react-query hook tests.
 * Returns both the client (for direct get/setQueryData) and the provider wrapper.
 *
 * Usage:
 *   const { qc, Wrapper } = createQueryWrapper();
 *   const { result } = renderHook(() => useFoo(), { wrapper: Wrapper });
 */
export function createQueryWrapper(): QueryWrapper {
    const qc = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    const Wrapper: React.ComponentType<{ children: React.ReactNode }> = ({
        children,
    }) => React.createElement(QueryClientProvider, { client: qc }, children);

    return { qc, Wrapper };
}
