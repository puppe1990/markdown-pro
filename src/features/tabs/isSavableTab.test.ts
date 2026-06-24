import { describe, it, expect } from 'vitest';
import { isSavableTab } from './isSavableTab';

describe('isSavableTab', () => {
    it('returns false for default Untitled names with empty content', () => {
        expect(isSavableTab({ name: 'Untitled', content: '' })).toBe(false);
        expect(isSavableTab({ name: 'Untitled 2', content: '   ' })).toBe(
            false,
        );
    });

    it('returns true when content has text', () => {
        expect(isSavableTab({ name: 'Untitled', content: '# Hello' })).toBe(
            true,
        );
    });

    it('returns true when name was customized', () => {
        expect(isSavableTab({ name: 'Meeting Notes', content: '' })).toBe(true);
    });
});
