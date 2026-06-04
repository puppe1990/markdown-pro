import { useQuery } from '@tanstack/react-query';
import {
    getPreferences,
    setTheme,
    type Preferences,
} from './preferences.functions';
import { useOptimisticMutation } from '@/src/lib/use-optimistic-mutation';

type SetThemeVariables = {
    data: { theme: 'light' | 'dark' };
};

/**
 * Fetches user preferences (theme etc).
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
 *
 * Example:
 *   const setTheme = useSetTheme();
 *   setTheme.mutate({ data: { theme: 'dark' } });
 */
export function useSetTheme() {
    return useOptimisticMutation<SetThemeVariables, Preferences>(setTheme, {
        queryKey: ['preferences'],
        updater: (_old, input) => ({ theme: input.data.theme }),
    });
}
