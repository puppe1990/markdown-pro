import type { Tab } from './useTabManager';

/**
 * Builds the tab list shown in the UI by layering query/local tabs with
 * in-flight local edits that must not be overwritten by stale server refetches.
 *
 * Example:
 *   buildDisplayTabs(serverTabs, localTabs, { 'tab-1': '# draft' })
 */
export function buildDisplayTabs(
    queryTabs: Tab[] | undefined,
    localTabs: Tab[],
    pendingContent: Record<string, string>,
    stagedTabIds: ReadonlySet<string>,
): Tab[] {
    const base = queryTabs ?? localTabs;
    const baseIds = new Set(base.map((tab) => tab.id));
    const localOnly = localTabs.filter((tab) => {
        if (baseIds.has(tab.id)) return false;
        if (queryTabs === undefined) return false;
        return stagedTabIds.has(tab.id) || pendingContent[tab.id] !== undefined;
    });

    return [...base, ...localOnly].map((tab) => ({
        ...tab,
        content: pendingContent[tab.id] ?? tab.content,
    }));
}
