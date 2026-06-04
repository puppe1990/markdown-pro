import { useQuery } from '@tanstack/react-query';
import {
    getTabs,
    createTab,
    updateTab,
    deleteTab,
    type Tab,
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
 * Mutation to delete a tab, optimistically removing it from the cache.
 *
 * Example:
 *   const deleteTab = useDeleteTab();
 *   deleteTab.mutate({ data: { id: 'tab-123' } });
 */
export function useDeleteTab() {
    return useOptimisticMutation<TabVariables>(deleteTab, {
        queryKey: ['tabs'],
        updater: (old, input) =>
            (old as Tab[] | undefined)?.filter((t) => t.id !== input.data.id),
    });
}
