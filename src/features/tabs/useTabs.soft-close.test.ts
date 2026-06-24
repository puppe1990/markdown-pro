import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createQueryWrapper } from '@/src/test/create-query-wrapper';
import type { SavedTab } from './tabs.functions';

vi.mock('./tabs.functions', () => ({
    hideTab: vi.fn().mockResolvedValue(undefined),
    openTab: vi
        .fn()
        .mockResolvedValue({ id: 'closed-1', name: 'Note', content: '# Hi' }),
    getAllTabs: vi.fn(),
}));

import { hideTab, openTab } from './tabs.functions';
import { useHideTab, useOpenTab } from './useTabs';

describe('useHideTab', () => {
    beforeEach(() => {
        vi.mocked(hideTab).mockClear();
    });

    it('optimistically removes tab from open tabs cache', async () => {
        const { qc, Wrapper } = createQueryWrapper();
        qc.setQueryData(
            ['tabs'],
            [
                { id: 'open-1', name: 'A', content: '' },
                { id: 'open-2', name: 'B', content: '# text' },
            ],
        );

        const { result } = renderHook(() => useHideTab(), { wrapper: Wrapper });

        result.current.mutate({ data: { id: 'open-1' } });

        await waitFor(() => {
            const cached = qc.getQueryData(['tabs']) as Array<{ id: string }>;
            expect(cached).toHaveLength(1);
            expect(cached[0]?.id).toBe('open-2');
        });
    });
});

describe('useOpenTab', () => {
    beforeEach(() => {
        vi.mocked(openTab).mockClear();
    });

    it('optimistically adds tab back to open tabs cache', async () => {
        const closedTab: SavedTab = {
            id: 'closed-1',
            name: 'Note',
            content: '# Hi',
            isOpen: false,
            updatedAt: '2026-01-01',
        };

        const { qc, Wrapper } = createQueryWrapper();
        qc.setQueryData(['tabs'], [{ id: 'open-1', name: 'A', content: '' }]);
        qc.setQueryData(['tabs', 'all'], [closedTab]);

        const { result } = renderHook(() => useOpenTab(), { wrapper: Wrapper });

        result.current.mutate({ data: { id: 'closed-1' } });

        await waitFor(() => {
            const cached = qc.getQueryData(['tabs']) as Array<{
                id: string;
                name: string;
            }>;
            expect(cached).toHaveLength(2);
            expect(cached[1]).toEqual({
                id: 'closed-1',
                name: 'Note',
                content: '# Hi',
            });
        });
    });
});
