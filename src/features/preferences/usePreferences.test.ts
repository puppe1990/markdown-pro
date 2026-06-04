import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSetTheme } from './usePreferences';
import { createQueryWrapper } from '@/src/test/create-query-wrapper';

vi.mock('./preferences.functions', async (importOriginal) => {
    const actual =
        await importOriginal<typeof import('./preferences.functions')>();
    return {
        ...actual,
        getPreferences: vi.fn().mockResolvedValue({ theme: 'light' }),
        setTheme: vi.fn().mockResolvedValue({ theme: 'dark' }),
    };
});

import * as prefsFunctions from './preferences.functions';

class FakePreferencesFunctions {
    getPreferences = prefsFunctions.getPreferences;
    setTheme = prefsFunctions.setTheme;
}

const fakePrefs = new FakePreferencesFunctions();

describe('useSetTheme', () => {
    it('optimistically updates cache with correct theme value', async () => {
        const { qc, Wrapper } = createQueryWrapper();
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
        fakePrefs.setTheme.mockRejectedValueOnce(new Error('network'));

        const { qc, Wrapper } = createQueryWrapper();
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
