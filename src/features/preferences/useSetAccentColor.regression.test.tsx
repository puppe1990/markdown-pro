import { describe, expect, it, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSetAccentColor } from './usePreferences';
import { createQueryWrapper } from '@/src/test/create-query-wrapper';

vi.mock('./preferences.functions', async (importOriginal) => {
    const actual =
        await importOriginal<typeof import('./preferences.functions')>();
    return {
        ...actual,
        getPreferences: vi.fn(),
        setAccentColor: vi.fn(),
        setTheme: vi.fn(),
    };
});

import * as prefsFunctions from './preferences.functions';

describe('useSetAccentColor regression: rose must not revert to teal', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('keeps rose in cache after mutation settles even when refetch returns stale teal', async () => {
        vi.mocked(prefsFunctions.getPreferences).mockResolvedValue({
            theme: 'light',
            accentColor: 'teal',
        });
        vi.mocked(prefsFunctions.setAccentColor).mockResolvedValue({
            theme: 'light',
            accentColor: 'rose',
        });

        const { qc, Wrapper } = createQueryWrapper();
        qc.setQueryData(['preferences'], {
            theme: 'light',
            accentColor: 'teal',
        });

        const { result } = renderHook(() => useSetAccentColor(), {
            wrapper: Wrapper,
        });

        result.current.mutate({ data: { accentColor: 'rose' } });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        await waitFor(() => {
            const cached = qc.getQueryData<{ accentColor: string }>([
                'preferences',
            ]);
            expect(cached?.accentColor).toBe('rose');
        });

        // Stale refetch must not overwrite the server-confirmed rose preference.
        expect(prefsFunctions.getPreferences).not.toHaveBeenCalled();
    });
});
