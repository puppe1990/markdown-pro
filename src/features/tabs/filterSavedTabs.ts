import type { SavedTab } from './tabs.functions';

/**
 * Filters saved documents by name or content.
 *
 * Example:
 *   filterSavedTabs(tabs, 'meeting') // matches "Meeting Notes"
 */
export function filterSavedTabs(tabs: SavedTab[], query: string): SavedTab[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
        return tabs;
    }
    return tabs.filter(
        (tab) =>
            tab.name.toLowerCase().includes(normalized) ||
            tab.content.toLowerCase().includes(normalized),
    );
}
