import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useApplyAccentColor } from './useApplyAccentColor';

describe('useApplyAccentColor', () => {
    beforeEach(() => {
        document.documentElement.style.removeProperty('--color-accent');
        document.documentElement.classList.remove('dark');
    });

    afterEach(() => {
        document.documentElement.style.removeProperty('--color-accent');
        document.documentElement.classList.remove('dark');
    });

    it('applies accent CSS variables when accent color changes', () => {
        const { rerender } = renderHook(
            ({ accentColor, colorScheme }) =>
                useApplyAccentColor({ accentColor, colorScheme }),
            {
                initialProps: {
                    accentColor: 'teal' as const,
                    colorScheme: 'light' as const,
                },
            },
        );

        expect(
            document.documentElement.style.getPropertyValue('--color-accent'),
        ).toBe('#0d9488');

        rerender({ accentColor: 'blue', colorScheme: 'light' });

        expect(
            document.documentElement.style.getPropertyValue('--color-accent'),
        ).toBe('#2563eb');
    });

    it('re-applies tokens when color scheme changes', () => {
        const { rerender } = renderHook(
            ({ accentColor, colorScheme }) =>
                useApplyAccentColor({ accentColor, colorScheme }),
            {
                initialProps: {
                    accentColor: 'blue' as const,
                    colorScheme: 'light' as const,
                },
            },
        );

        expect(
            document.documentElement.style.getPropertyValue('--color-accent'),
        ).toBe('#2563eb');

        rerender({ accentColor: 'blue', colorScheme: 'dark' });

        expect(
            document.documentElement.style.getPropertyValue('--color-accent'),
        ).toBe('#60a5fa');
    });
});
