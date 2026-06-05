import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
    applyDocumentTheme,
    parseThemePreference,
    readSystemColorScheme,
    resolveTheme,
    subscribeSystemColorScheme,
    toggleExplicitTheme,
} from './theme';

describe('resolveTheme', () => {
    it('returns OS dark when preference is system and OS is dark', () => {
        expect(resolveTheme('system', 'dark')).toBe('dark');
    });

    it('returns OS light when preference is system and OS is light', () => {
        expect(resolveTheme('system', 'light')).toBe('light');
    });

    it('keeps explicit light when OS is dark', () => {
        expect(resolveTheme('light', 'dark')).toBe('light');
    });

    it('keeps explicit dark when OS is light', () => {
        expect(resolveTheme('dark', 'light')).toBe('dark');
    });
});

describe('toggleExplicitTheme', () => {
    it('switches light to dark', () => {
        expect(toggleExplicitTheme('light')).toBe('dark');
    });

    it('switches dark to light', () => {
        expect(toggleExplicitTheme('dark')).toBe('light');
    });
});

describe('parseThemePreference', () => {
    it('accepts system', () => {
        expect(parseThemePreference('system')).toBe('system');
    });

    it('falls back invalid values to system', () => {
        expect(parseThemePreference('auto')).toBe('system');
    });
});

describe('readSystemColorScheme', () => {
    const listeners: Array<(e: MediaQueryListEvent) => void> = [];
    let matches = false;

    beforeEach(() => {
        matches = false;
        vi.stubGlobal('matchMedia', (query: string) => ({
            matches,
            media: query,
            addEventListener: (
                _type: string,
                handler: (e: MediaQueryListEvent) => void,
            ) => {
                listeners.push(handler);
            },
            removeEventListener: (
                _type: string,
                handler: (e: MediaQueryListEvent) => void,
            ) => {
                const index = listeners.indexOf(handler);
                if (index >= 0) listeners.splice(index, 1);
            },
        }));
    });

    afterEach(() => {
        listeners.length = 0;
        vi.unstubAllGlobals();
    });

    it('returns dark when prefers-color-scheme is dark', () => {
        matches = true;
        expect(readSystemColorScheme()).toBe('dark');
    });

    it('returns light when prefers-color-scheme is light', () => {
        matches = false;
        expect(readSystemColorScheme()).toBe('light');
    });
});

describe('subscribeSystemColorScheme', () => {
    const handlers: Array<(e: MediaQueryListEvent) => void> = [];

    beforeEach(() => {
        vi.stubGlobal('matchMedia', () => ({
            matches: false,
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
        vi.unstubAllGlobals();
    });

    it('notifies listener when OS scheme changes', () => {
        const listener = vi.fn();
        subscribeSystemColorScheme(listener);
        handlers[0]?.({ matches: true } as MediaQueryListEvent);
        expect(listener).toHaveBeenCalledWith('dark');
    });

    it('removes listener on unsubscribe', () => {
        const listener = vi.fn();
        const unsubscribe = subscribeSystemColorScheme(listener);
        unsubscribe();
        expect(handlers).toHaveLength(0);
    });
});

describe('applyDocumentTheme', () => {
    beforeEach(() => {
        document.documentElement.classList.remove('dark');
    });

    it('adds dark class when resolved theme is dark', () => {
        applyDocumentTheme('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes dark class when resolved theme is light', () => {
        document.documentElement.classList.add('dark');
        applyDocumentTheme('light');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
});
