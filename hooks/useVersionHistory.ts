import { useState, useCallback } from 'react';
import {
    useVersions,
    useSaveVersion,
} from '@/src/features/versions/useVersions';
import { Version as DbVersion } from '@/src/features/versions/versions.functions';
import { Version } from '@/types';

export function useVersionHistory(
    setMarkdown: (content: string) => void,
    activeTabId?: string,
) {
    const { data: remoteVersions } = useVersions(activeTabId);
    const saveVersionMut = useSaveVersion();

    const [localVersions, setLocalVersions] = useState<Version[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem('markdown-versions');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed as Version[];
            }
        } catch {
            /* ignore */
        }
        return [];
    });

    const remoteMapped: Version[] = (remoteVersions ?? []).map(
        (v: DbVersion) => ({
            content: v.content,
            timestamp: new Date(v.created_at).getTime(),
        }),
    );

    const versions = remoteMapped.length > 0 ? remoteMapped : localVersions;

    const saveVersion = useCallback(
        (content: string) => {
            setLocalVersions((prev) => {
                const latest = prev[0];
                if (latest && latest.content === content) return prev;

                const newVersion: Version = { content, timestamp: Date.now() };
                return [newVersion, ...prev].slice(0, 50);
            });

            if (activeTabId) {
                saveVersionMut.mutate({
                    data: { tabId: activeTabId, content },
                });
            }
        },
        [activeTabId, saveVersionMut],
    );

    const addLocalVersion = useCallback((content: string) => {
        setLocalVersions((prev) => {
            const latest = prev[0];
            if (latest && latest.content === content) return prev;

            const newVersion: Version = { content, timestamp: Date.now() };
            return [newVersion, ...prev].slice(0, 50);
        });
    }, []);

    const revertToVersion = useCallback(
        (versionIndex: number) => {
            const versionToRevert = versions[versionIndex];
            if (versionToRevert) {
                setMarkdown(versionToRevert.content);
            }
        },
        [versions, setMarkdown],
    );

    return { versions, saveVersion, addLocalVersion, revertToVersion };
}
