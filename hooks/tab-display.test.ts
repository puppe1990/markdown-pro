import { describe, it, expect } from 'vitest';
import { buildDisplayTabs } from './tab-display';
import type { Tab } from './useTabManager';

describe('buildDisplayTabs', () => {
    it('overlays pending local edits onto server tabs', () => {
        const serverTabs: Tab[] = [{ id: 'a', name: 'Notes', content: '' }];

        const tabs = buildDisplayTabs(
            serverTabs,
            [],
            { a: '# draft' },
            new Set(),
        );

        expect(tabs).toEqual([{ id: 'a', name: 'Notes', content: '# draft' }]);
    });

    it('includes local-only tabs that are not on the server yet', () => {
        const serverTabs: Tab[] = [
            { id: 'existing', name: 'Saved', content: '# Note' },
        ];
        const localTabs: Tab[] = [
            { id: 'existing', name: 'Saved', content: '# Note' },
            { id: 'new-tab', name: 'Untitled 2', content: '' },
        ];

        const tabs = buildDisplayTabs(
            serverTabs,
            localTabs,
            { 'new-tab': '# fresh draft' },
            new Set(['new-tab']),
        );

        expect(tabs).toHaveLength(2);
        expect(tabs[1]).toEqual({
            id: 'new-tab',
            name: 'Untitled 2',
            content: '# fresh draft',
        });
    });
});
