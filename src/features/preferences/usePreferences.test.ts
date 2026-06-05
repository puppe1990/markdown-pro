import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSetAccentColor, useSetTheme } from './usePreferences';
import { createQueryWrapper } from '@/src/test/create-query-wrapper';

vi.mock('./preferences.functions', async (importOriginal) => {
    const actual =
        await importOriginal<typeof import('./preferences.functions')>();
    return {
        ...actual,
        getPreferences: vi.fn().mockResolvedValue({
            theme: 'light',
            accentColor: 'teal',
        }),
        setTheme: vi
            .fn()
            .mockResolvedValue({ theme: 'dark', accentColor: 'teal' }),
        setAccentColor: vi.fn().mockResolvedValue({
            theme: 'light',
            accentColor: 'blue',
        }),
    };
});

import * as prefsFunctions from './preferences.functions';

class FakePreferencesFunctions {
    getPreferences = prefsFunctions.getPreferences;
    setTheme = prefsFunctions.setTheme;
    setAccentColor = prefsFunctions.setAccentColor;
}

const fakePrefs = new FakePreferencesFunctions();

describe('useSetTheme', () => {
    it('optimistically updates cache with correct theme value', async () => {
        const { qc, Wrapper } = createQueryWrapper();
        qc.setQueryData(['preferences'], {
            theme: 'light',
            accentColor: 'teal',
        });

        const { result } = renderHook(() => useSetTheme(), {
            wrapper: Wrapper,
        });

        result.current.mutate({ data: { theme: 'dark' } });

        await waitFor(() => {
            const cached = qc.getQueryData(['preferences']);
            expect(cached).toEqual({ theme: 'dark', accentColor: 'teal' });
        });
    });

    it('rolls back cache on error', async () => {
        fakePrefs.setTheme.mockRejectedValueOnce(new Error('network'));

        const { qc, Wrapper } = createQueryWrapper();
        qc.setQueryData(['preferences'], {
            theme: 'light',
            accentColor: 'teal',
        });

        const { result } = renderHook(() => useSetTheme(), {
            wrapper: Wrapper,
        });

        result.current.mutate({ data: { theme: 'dark' } });

        await waitFor(() => {
            const cached = qc.getQueryData(['preferences']);
            expect(cached).toEqual({ theme: 'light', accentColor: 'teal' });
        });
    });
});

describe('useSetAccentColor', () => {
    it('optimistically updates cache with accent color', async () => {
        const { qc, Wrapper } = createQueryWrapper();
        qc.setQueryData(['preferences'], {
            theme: 'light',
            accentColor: 'teal',
        });

        const { result } = renderHook(() => useSetAccentColor(), {
            wrapper: Wrapper,
        });

        result.current.mutate({ data: { accentColor: 'blue' } });

        await waitFor(() => {
            const cached = qc.getQueryData(['preferences']);
            expect(cached).toEqual({ theme: 'light', accentColor: 'blue' });
        });
    });
});
