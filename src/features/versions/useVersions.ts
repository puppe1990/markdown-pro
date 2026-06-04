import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVersions, saveVersion } from './versions.functions';

export function useVersions(tabId: string | undefined) {
    return useQuery({
        queryKey: ['versions', tabId],
        queryFn: () => getVersions({ data: { tabId: tabId! } }),
        enabled: !!tabId,
    });
}

export function useSaveVersion() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: saveVersion,
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ['versions', variables.tabId] });
        },
    });
}
