import {
    useMutation,
    useQueryClient,
    type UseMutationResult,
} from '@tanstack/react-query';

export interface OptimisticOptions<TVariables> {
    queryKey: unknown[];
    updater: (oldData: unknown, variables: TVariables) => unknown;
    /** When true, writes mutation result to cache on success instead of invalidating. */
    commitResultOnSuccess?: boolean;
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
    const commitResult = options.commitResultOnSuccess ?? false;

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
        onSuccess: (data) => {
            if (commitResult) {
                qc.setQueryData(options.queryKey, data);
            }
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
        onSettled: (_data, error) => {
            if (!commitResult || error) {
                qc.invalidateQueries({ queryKey: options.queryKey });
            }
        },
    });
}
