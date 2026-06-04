import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCreateTab, useTabs } from './useTabs';
import { createQueryWrapper } from '@/src/test/create-query-wrapper';

vi.mock('./tabs.functions', async (importOriginal) => {
    const actual = await importOriginal<typeof import('./tabs.functions')>();
    return {
        ...actual,
        createTab: vi
            .fn()
            .mockResolvedValue({ id: 'new-tab', name: 'Test', content: '' }),
    };
});

import * as tabsFunctions from './tabs.functions';

class FakeTabsFunctions {
    createTab = tabsFunctions.createTab;
}

const fakeTabs = new FakeTabsFunctions();

describe('useCreateTab', () => {
    it('optimistically adds tab to cache before server responds', async () => {
        const { qc, Wrapper } = createQueryWrapper();
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
        const { qc, Wrapper } = createQueryWrapper();

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
        fakeTabs.createTab.mockRejectedValueOnce(new Error('network'));

        const { qc, Wrapper } = createQueryWrapper();
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

describe('optimistic updates visible to useTabs consumers', () => {
    it('new tab appears immediately in useTabs data', async () => {
        const { qc, Wrapper } = createQueryWrapper();
        qc.setQueryData(
            ['tabs'],
            [{ id: 'existing', name: 'Existing', content: '' }],
        );

        const { result: tabsResult } = renderHook(() => useTabs(), {
            wrapper: Wrapper,
        });
        const { result: createResult } = renderHook(() => useCreateTab(), {
            wrapper: Wrapper,
        });

        createResult.current.mutate({ data: { id: 'new-tab', name: 'Fresh' } });

        await waitFor(() => {
            expect(tabsResult.current.data).toHaveLength(2);
            expect(tabsResult.current.data?.[1]).toEqual({
                id: 'new-tab',
                name: 'Fresh',
                content: '',
            });
        });
    });
});
