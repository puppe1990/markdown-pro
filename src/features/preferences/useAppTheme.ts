import { useCallback, useEffect, useState } from 'react';
import {
    applyDocumentTheme,
    readSystemColorScheme,
    resolveTheme,
    subscribeSystemColorScheme,
    toggleExplicitTheme,
    type ColorScheme,
    type ThemePreference,
} from './theme';

type UseAppThemeOptions = {
    preference?: ThemePreference;
    onPreferenceChange?: (theme: ThemePreference) => void;
};

/**
 * Resolves and applies light/dark theme, following OS when preference is `system`.
 *
 * Example:
 *   const { resolved, toggleTheme } = useAppTheme({
 *     preference: prefs?.theme ?? 'system',
 *     onPreferenceChange: (t) => setTheme.mutate({ data: { theme: t } }),
 *   });
 */
export function useAppTheme({
    preference = 'system',
    onPreferenceChange,
}: UseAppThemeOptions = {}) {
    const [systemScheme, setSystemScheme] = useState<ColorScheme>(
        readSystemColorScheme,
    );

    useEffect(() => subscribeSystemColorScheme(setSystemScheme), []);

    const resolved = resolveTheme(preference, systemScheme);

    useEffect(() => {
        applyDocumentTheme(resolved);
    }, [resolved]);

    const toggleTheme = useCallback(() => {
        const next = toggleExplicitTheme(resolved);
        onPreferenceChange?.(next);
    }, [resolved, onPreferenceChange]);

    return {
        resolved,
        preference,
        systemScheme,
        toggleTheme,
    };
}
