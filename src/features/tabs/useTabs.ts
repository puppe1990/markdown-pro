import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getTabs,
    createTab,
    updateTab,
    deleteTab,
    type Tab,
} from './tabs.server';

export function useTabs() {
    return useQuery({
        queryKey: ['tabs'],
        queryFn: () => getTabs(),
    });
}

export function useCreateTab() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createTab,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tabs'] }),
    });
}

export function useUpdateTab() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateTab,
        onMutate: async (input) => {
            await qc.cancelQueries({ queryKey: ['tabs'] });
            const previous = qc.getQueryData<Tab[]>(['tabs']);
            qc.setQueryData<Tab[]>(['tabs'], (old) =>
                old?.map((t) =>
                    t.id === input.id
                        ? { ...t, name: input.name ?? t.name, content: input.content ?? t.content }
                        : t,
                ),
            );
            return { previous };
        },
        onError: (_err, _input, context) => {
            qc.setQueryData(['tabs'], context?.previous);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ['tabs'] }),
    });
}

export function useDeleteTab() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteTab,
        onMutate: async (input) => {
            await qc.cancelQueries({ queryKey: ['tabs'] });
            const previous = qc.getQueryData<Tab[]>(['tabs']);
            qc.setQueryData<Tab[]>(['tabs'], (old) => old?.filter((t) => t.id !== input.id));
            return { previous };
        },
        onError: (_err, _input, context) => {
            qc.setQueryData(['tabs'], context?.previous);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ['tabs'] }),
    });
}
