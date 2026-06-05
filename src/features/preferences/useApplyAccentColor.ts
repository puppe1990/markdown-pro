import { useEffect } from 'react';
import { applyDocumentAccent, type AccentColorId } from './accent';
import type { ColorScheme } from './theme';

type UseApplyAccentColorOptions = {
    accentColor?: AccentColorId;
    colorScheme?: ColorScheme;
};

/**
 * Syncs accent CSS variables when user preference or resolved theme changes.
 *
 * Example:
 *   useApplyAccentColor({ accentColor: 'blue', colorScheme: resolved });
 */
export function useApplyAccentColor({
    accentColor = 'teal',
    colorScheme = 'light',
}: UseApplyAccentColorOptions = {}) {
    useEffect(() => {
        applyDocumentAccent(accentColor, colorScheme);
    }, [accentColor, colorScheme]);
}
