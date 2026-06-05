import { describe, expect, it } from 'vitest';
import { parseThemePreference } from './theme';

describe('parseThemePreference (server row compatibility)', () => {
    it('accepts system for default OS following', () => {
        expect(parseThemePreference('system')).toBe('system');
    });

    it('preserves explicit user overrides', () => {
        expect(parseThemePreference('dark')).toBe('dark');
        expect(parseThemePreference('light')).toBe('light');
    });

    it('falls back unknown DB values to system', () => {
        expect(parseThemePreference('invalid-theme')).toBe('system');
    });
});
