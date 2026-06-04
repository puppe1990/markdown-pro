import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getPreferences,
    setTheme,
    type Preferences,
} from './preferences.functions';

export function usePreferences() {
    return useQuery({
        queryKey: ['preferences'],
        queryFn: () => getPreferences(),
    });
}

export function useSetTheme() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: setTheme,
        onMutate: async (input) => {
            await qc.cancelQueries({ queryKey: ['preferences'] });
            const previous = qc.getQueryData<Preferences>(['preferences']);
            qc.setQueryData<Preferences>(['preferences'], {
                theme: input.theme,
            });
            return { previous };
        },
        onError: (_err, _input, context) => {
            qc.setQueryData(['preferences'], context?.previous);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ['preferences'] }),
    });
}
