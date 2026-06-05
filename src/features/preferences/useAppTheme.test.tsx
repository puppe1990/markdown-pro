import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppTheme } from './useAppTheme';

describe('useAppTheme', () => {
    const handlers: Array<(e: MediaQueryListEvent) => void> = [];
    let osDark = false;

    beforeEach(() => {
        osDark = false;
        document.documentElement.classList.remove('dark');
        vi.stubGlobal('matchMedia', () => ({
            get matches() {
                return osDark;
            },
            media: '(prefers-color-scheme: dark)',
            addEventListener: (
                _type: string,
                handler: (e: MediaQueryListEvent) => void,
            ) => {
                handlers.push(handler);
            },
            removeEventListener: (
                _type: string,
                handler: (e: MediaQueryListEvent) => void,
            ) => {
                const index = handlers.indexOf(handler);
                if (index >= 0) handlers.splice(index, 1);
            },
        }));
    });

    afterEach(() => {
        handlers.length = 0;
        document.documentElement.classList.remove('dark');
        vi.unstubAllGlobals();
    });

    it('follows OS dark mode when preference is system', () => {
        osDark = true;
        const { result } = renderHook(() =>
            useAppTheme({ preference: 'system' }),
        );
        expect(result.current.resolved).toBe('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('follows OS light mode when preference is system', () => {
        osDark = false;
        const { result } = renderHook(() =>
            useAppTheme({ preference: 'system' }),
        );
        expect(result.current.resolved).toBe('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('updates resolved theme when OS preference changes', () => {
        const { result } = renderHook(() =>
            useAppTheme({ preference: 'system' }),
        );
        expect(result.current.resolved).toBe('light');

        act(() => {
            osDark = true;
            handlers[0]?.({ matches: true } as MediaQueryListEvent);
        });

        expect(result.current.resolved).toBe('dark');
    });

    it('ignores OS when user preference is explicit dark', () => {
        osDark = false;
        const { result } = renderHook(() =>
            useAppTheme({ preference: 'dark' }),
        );
        expect(result.current.resolved).toBe('dark');
    });

    it('toggleTheme requests explicit opposite of resolved scheme', () => {
        osDark = true;
        const onPreferenceChange = vi.fn();
        const { result } = renderHook(() =>
            useAppTheme({
                preference: 'system',
                onPreferenceChange,
            }),
        );

        act(() => {
            result.current.toggleTheme();
        });

        expect(onPreferenceChange).toHaveBeenCalledWith('light');
    });
});
