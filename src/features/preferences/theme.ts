export type ColorScheme = 'light' | 'dark';

/** Stored preference; `system` follows OS `prefers-color-scheme`. */
export type ThemePreference = ColorScheme | 'system';

const PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Reads the OS color scheme.
 * Example: readSystemColorScheme() // 'dark' on macOS dark mode
 */
function getColorSchemeMedia(): MediaQueryList | null {
    if (typeof window === 'undefined') {
        return null;
    }
    if (typeof window.matchMedia !== 'function') {
        return null;
    }
    return window.matchMedia(PREFERS_DARK_QUERY);
}

export function readSystemColorScheme(): ColorScheme {
    const media = getColorSchemeMedia();
    if (!media) {
        return 'light';
    }
    return media.matches ? 'dark' : 'light';
}

/**
 * Resolves the active UI theme from user preference and OS scheme.
 * Example: resolveTheme('system', 'dark') // 'dark'
 */
export function resolveTheme(
    preference: ThemePreference,
    systemScheme: ColorScheme,
): ColorScheme {
    if (preference === 'system') {
        return systemScheme;
    }
    return preference;
}

/** Toggles explicit light/dark based on the currently resolved scheme. */
export function toggleExplicitTheme(resolved: ColorScheme): ColorScheme {
    return resolved === 'light' ? 'dark' : 'light';
}

/** Applies `dark` class on `<html>` for Tailwind dark mode. */
export function applyDocumentTheme(resolved: ColorScheme): void {
    if (typeof document === 'undefined') {
        return;
    }
    document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function parseThemePreference(value: string): ThemePreference {
    if (value === 'light' || value === 'dark' || value === 'system') {
        return value;
    }
    return 'system';
}

type SystemSchemeListener = (scheme: ColorScheme) => void;

/**
 * Subscribes to OS theme changes. Returns unsubscribe.
 * Example: const off = subscribeSystemColorScheme(setScheme); off();
 */
export function subscribeSystemColorScheme(
    listener: SystemSchemeListener,
): () => void {
    const media = getColorSchemeMedia();
    if (!media) {
        return () => {};
    }
    const handler = (event: MediaQueryListEvent) => {
        listener(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
}
