const DEFAULT_TAB_NAME = /^Untitled(\s+\d+)?$/i;

export interface TabSavabilityInput {
    name: string;
    content: string;
}

/**
 * Whether a tab should persist in saved documents when closed.
 *
 * Example:
 *   isSavableTab({ name: 'Untitled', content: '' }) // false
 *   isSavableTab({ name: 'Notes', content: '# Hi' }) // true
 */
export function isSavableTab(tab: TabSavabilityInput): boolean {
    if (tab.content.trim().length > 0) {
        return true;
    }
    return !DEFAULT_TAB_NAME.test(tab.name.trim());
}
