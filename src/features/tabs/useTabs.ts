import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getTabs,
    createTab,
    updateTab,
    deleteTab,
    type Tab,
} from './tabs.functions';

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
            const { id, name, content } = input.data;
            qc.setQueryData<Tab[]>(['tabs'], (old) =>
                old?.map((t) =>
                    t.id === id
                        ? {
                              ...t,
                              name: name ?? t.name,
                              content: content ?? t.content,
                          }
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
            qc.setQueryData<Tab[]>(['tabs'], (old) =>
                old?.filter((t) => t.id !== input.data.id),
            );
            return { previous };
        },
        onError: (_err, _input, context) => {
            qc.setQueryData(['tabs'], context?.previous);
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ['tabs'] }),
    });
}
