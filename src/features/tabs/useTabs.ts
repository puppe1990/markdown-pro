import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getTabs,
    getAllTabs,
    createTab,
    updateTab,
    hideTab,
    openTab,
    deleteTab,
    type Tab,
    type SavedTab,
} from './tabs.functions';
import { useOptimisticMutation } from '@/src/lib/use-optimistic-mutation';

type TabVariables = {
    data: {
        id: string;
        name?: string;
        content?: string;
    };
};

/**
 * Fetches the list of tabs for the current user.
 */
export function useTabs() {
    return useQuery({
        queryKey: ['tabs'],
        queryFn: () => getTabs(),
    });
}

/**
 * Fetches all saved documents, including closed tabs.
 */
export function useAllTabs() {
    return useQuery({
        queryKey: ['tabs', 'all'],
        queryFn: () => getAllTabs(),
    });
}

/**
 * Mutation to create a new tab.
 * Performs optimistic update: the tab appears in cache immediately (appended).
 * Rolls back the cache on error. Always invalidates on settle for server truth.
 *
 * Example:
 *   const createTab = useCreateTab();
 *   createTab.mutate({ data: { id: 'tab-123', name: 'Untitled' } });
 */
export function useCreateTab() {
    return useOptimisticMutation<TabVariables>(createTab, {
        queryKey: ['tabs'],
        updater: (old, input) => [
            ...((old as Tab[] | undefined) ?? []),
            {
                id: input.data.id,
                name: input.data.name ?? 'Untitled',
                content: '',
            },
        ],
    });
}

/**
 * Mutation to update a tab's name and/or content with optimistic update.
 *
 * Example:
 *   const updateTab = useUpdateTab();
 *   updateTab.mutate({ data: { id: 'tab-123', name: 'New Name' } });
 */
export function useUpdateTab() {
    return useOptimisticMutation<TabVariables>(updateTab, {
        queryKey: ['tabs'],
        updater: (old, input) =>
            (old as Tab[] | undefined)?.map((t) =>
                t.id === input.data.id
                    ? {
                          ...t,
                          name: input.data.name ?? t.name,
                          content: input.data.content ?? t.content,
                      }
                    : t,
            ),
    });
}

/**
 * Mutation to hide a tab from the dashboard without deleting its content.
 */
export function useHideTab() {
    return useOptimisticMutation<TabVariables>(hideTab, {
        queryKey: ['tabs'],
        updater: (old, input) =>
            (old as Tab[] | undefined)?.filter((t) => t.id !== input.data.id),
    });
}

/**
 * Mutation to reopen a closed tab on the dashboard.
 */
export function useOpenTab() {
    const qc = useQueryClient();

    return useOptimisticMutation<TabVariables, Tab>(openTab, {
        queryKey: ['tabs'],
        updater: (old, input) => {
            const allTabs = qc.getQueryData<SavedTab[]>(['tabs', 'all']);
            const saved = allTabs?.find((tab) => tab.id === input.data.id);
            if (!saved) {
                return old as Tab[] | undefined;
            }
            return [
                ...((old as Tab[] | undefined) ?? []),
                {
                    id: saved.id,
                    name: saved.name,
                    content: saved.content,
                },
            ];
        },
    });
}

/**
 * Mutation to permanently delete a tab and its version history.
 */
export function useDeleteTab() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: deleteTab,
        onMutate: async (variables) => {
            await qc.cancelQueries({ queryKey: ['tabs'] });
            await qc.cancelQueries({ queryKey: ['tabs', 'all'] });
            const previousOpen = qc.getQueryData(['tabs']);
            const previousAll = qc.getQueryData(['tabs', 'all']);
            qc.setQueryData(['tabs'], (old) =>
                (old as Tab[] | undefined)?.filter(
                    (t) => t.id !== variables.data.id,
                ),
            );
            qc.setQueryData(['tabs', 'all'], (old) =>
                (old as SavedTab[] | undefined)?.filter(
                    (t) => t.id !== variables.data.id,
                ),
            );
            return { previousOpen, previousAll };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousOpen !== undefined) {
                qc.setQueryData(['tabs'], context.previousOpen);
            }
            if (context?.previousAll !== undefined) {
                qc.setQueryData(['tabs', 'all'], context.previousAll);
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ['tabs'] });
            qc.invalidateQueries({ queryKey: ['tabs', 'all'] });
        },
    });
}
