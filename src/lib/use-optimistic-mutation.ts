import {
    useMutation,
    useQueryClient,
    type UseMutationResult,
} from '@tanstack/react-query';

export interface OptimisticOptions<TVariables> {
    queryKey: unknown[];
    updater: (oldData: unknown, variables: TVariables) => unknown;
}

/**
 * Generic hook for mutations that need optimistic updates + automatic rollback + invalidate.
 *
 * Usage example:
 *   const mutation = useOptimisticMutation(createTab, {
 *     queryKey: ['tabs'],
 *     updater: (old, vars) => [...(old ?? []), vars.data],
 *   });
 */
export function useOptimisticMutation<
    TVariables,
    TData = unknown,
    TError = Error,
>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options: OptimisticOptions<TVariables>,
): UseMutationResult<TData, TError, TVariables> {
    const qc = useQueryClient();

    return useMutation({
        mutationFn,
        onMutate: async (variables) => {
            await qc.cancelQueries({ queryKey: options.queryKey });
            const previous = qc.getQueryData(options.queryKey);
            qc.setQueryData(options.queryKey, (old) =>
                options.updater(old, variables),
            );
            return { previous };
        },
        onError: (
            _err,
            _variables,
            context: { previous?: unknown } | undefined,
        ) => {
            if (context?.previous !== undefined) {
                qc.setQueryData(options.queryKey, context.previous);
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: options.queryKey });
        },
    });
}
