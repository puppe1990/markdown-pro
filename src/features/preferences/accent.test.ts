import { describe, expect, it, beforeEach } from 'vitest';
import {
    applyDocumentAccent,
    getAccentTokens,
    parseAccentColor,
    ACCENT_COLOR_OPTIONS,
} from './accent';

describe('parseAccentColor', () => {
    it('returns teal for unknown values', () => {
        expect(parseAccentColor('not-a-color')).toBe('teal');
    });

    it('returns the id for known accent colors', () => {
        expect(parseAccentColor('blue')).toBe('blue');
        expect(parseAccentColor('violet')).toBe('violet');
    });
});

describe('getAccentTokens', () => {
    it('returns teal light tokens by default', () => {
        const tokens = getAccentTokens('teal', 'light');
        expect(tokens.accent).toBe('#0d9488');
        expect(tokens.hover).toBe('#0f766e');
    });

    it('returns blue dark tokens when scheme is dark', () => {
        const tokens = getAccentTokens('blue', 'dark');
        expect(tokens.accent).toBe('#60a5fa');
        expect(tokens.muted).toContain('rgba');
    });
});

describe('applyDocumentAccent', () => {
    beforeEach(() => {
        document.documentElement.style.removeProperty('--color-accent');
        document.documentElement.style.removeProperty('--color-accent-hover');
        document.documentElement.style.removeProperty('--color-accent-light');
        document.documentElement.style.removeProperty('--color-accent-muted');
        document.documentElement.classList.remove('dark');
    });

    it('sets CSS variables on documentElement for light blue', () => {
        applyDocumentAccent('blue', 'light');

        expect(
            document.documentElement.style.getPropertyValue('--color-accent'),
        ).toBe('#2563eb');
        expect(
            document.documentElement.style.getPropertyValue(
                '--color-accent-hover',
            ),
        ).toBe('#1d4ed8');
    });

    it('uses dark variant tokens when color scheme is dark', () => {
        document.documentElement.classList.add('dark');
        applyDocumentAccent('rose', 'dark');

        expect(
            document.documentElement.style.getPropertyValue('--color-accent'),
        ).toBe('#fb7185');
    });
});

describe('ACCENT_COLOR_OPTIONS', () => {
    it('includes teal and at least one non-teal option', () => {
        const ids = ACCENT_COLOR_OPTIONS.map((o) => o.id);
        expect(ids).toContain('teal');
        expect(ids).toContain('blue');
        expect(ids.length).toBeGreaterThanOrEqual(4);
    });
});
