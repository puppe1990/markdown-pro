import { describe, expect, it } from 'vitest';
import { parseAccentColor } from './accent';
import { parseThemePreference } from './theme';

describe('parseAccentColor (server row compatibility)', () => {
    it('defaults invalid accent to teal', () => {
        expect(parseAccentColor('invalid')).toBe('teal');
    });

    it('accepts known accent ids', () => {
        expect(parseAccentColor('violet')).toBe('violet');
        expect(parseAccentColor('emerald')).toBe('emerald');
    });
});

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
