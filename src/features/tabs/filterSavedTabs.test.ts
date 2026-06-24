import { describe, it, expect } from 'vitest';
import { filterSavedTabs } from './filterSavedTabs';
import type { SavedTab } from './tabs.functions';

const tabs: SavedTab[] = [
    {
        id: 'tab-1',
        name: 'Meeting Notes',
        content: '# Agenda',
        isOpen: true,
        updatedAt: '2026-06-01',
    },
    {
        id: 'tab-2',
        name: 'Draft',
        content: 'shopping list',
        isOpen: false,
        updatedAt: '2026-06-02',
    },
];

describe('filterSavedTabs', () => {
    it('returns all tabs when query is empty', () => {
        expect(filterSavedTabs(tabs, '')).toHaveLength(2);
    });

    it('filters by name or content case-insensitively', () => {
        expect(filterSavedTabs(tabs, 'SHOPPING')).toEqual([tabs[1]]);
        expect(filterSavedTabs(tabs, 'meeting')).toEqual([tabs[0]]);
    });
});
