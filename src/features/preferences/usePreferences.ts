import { useQuery } from '@tanstack/react-query';
import {
    getPreferences,
    setAccentColor,
    setTheme,
    type Preferences,
} from './preferences.functions';
import { useOptimisticMutation } from '@/src/lib/use-optimistic-mutation';
import type { AccentColorId } from './accent';
import type { ThemePreference } from './theme';

type SetThemeVariables = {
    data: { theme: ThemePreference };
};

type SetAccentColorVariables = {
    data: { accentColor: AccentColorId };
};

/**
 * Fetches user preferences (theme, accent color, etc).
 */
export function usePreferences() {
    return useQuery({
        queryKey: ['preferences'],
        queryFn: () => getPreferences(),
    });
}

/**
 * Mutation to set the UI theme. Optimistically updates the preferences cache
 * immediately, with rollback on error and invalidate on settle.
 */
export function useSetTheme() {
    return useOptimisticMutation<SetThemeVariables, Preferences>(setTheme, {
        queryKey: ['preferences'],
        commitResultOnSuccess: true,
        updater: (old, input) => ({
            theme: input.data.theme,
            accentColor: old?.accentColor ?? 'teal',
        }),
    });
}

/**
 * Mutation to set the accent color. Optimistically updates preferences cache.
 */
export function useSetAccentColor() {
    return useOptimisticMutation<SetAccentColorVariables, Preferences>(
        setAccentColor,
        {
            queryKey: ['preferences'],
            commitResultOnSuccess: true,
            updater: (old, input) => ({
                theme: old?.theme ?? 'system',
                accentColor: input.data.accentColor,
            }),
        },
    );
}
