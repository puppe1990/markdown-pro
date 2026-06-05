import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useEffect, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '@/components/Header';
import { useAppTheme } from './useAppTheme';
import { useApplyAccentColor } from './useApplyAccentColor';
import type { ThemePreference } from './theme';
import type { AccentColorId } from './accent';

vi.mock('@/services/exportService', () => ({
    exportAsMarkdown: vi.fn(),
    exportAsPdf: vi.fn(),
    exportAsDocx: vi.fn(),
}));

function ThemeSettingsHarness({
    preference: externalPreference,
    accentColor: externalAccentColor = 'teal',
    onPreferenceChange,
    onAccentColorChange = vi.fn(),
}: {
    preference: ThemePreference;
    accentColor?: AccentColorId;
    onPreferenceChange: (theme: ThemePreference) => void;
    onAccentColorChange?: (accent: AccentColorId) => void;
}) {
    const [preference, setPreference] = useState(externalPreference);
    const [accentColor, setAccentColor] = useState(externalAccentColor);

    useEffect(() => {
        setPreference(externalPreference);
    }, [externalPreference]);

    useEffect(() => {
        setAccentColor(externalAccentColor);
    }, [externalAccentColor]);

    const handlePreferenceChange = (next: ThemePreference) => {
        onPreferenceChange(next);
        setPreference(next);
    };

    const handleAccentChange = (next: AccentColorId) => {
        onAccentColorChange(next);
        setAccentColor(next);
    };

    const { resolved: colorScheme } = useAppTheme({
        preference,
        onPreferenceChange: handlePreferenceChange,
    });

    useApplyAccentColor({ accentColor, colorScheme });

    return (
        <Header
            themePreference={preference}
            onThemePreferenceChange={handlePreferenceChange}
            accentColor={accentColor}
            onAccentColorChange={handleAccentChange}
            onHistoryClick={vi.fn()}
            onReadingModeToggle={vi.fn()}
            isReadingMode={false}
            markdownContent=""
            onImportMarkdown={vi.fn()}
        />
    );
}

describe('theme settings integration', () => {
    const handlers: Array<(e: MediaQueryListEvent) => void> = [];
    let osDark = false;

    beforeEach(() => {
        osDark = false;
        document.documentElement.classList.remove('dark');
        vi.stubGlobal('matchMedia', () => ({
            get matches() {
                return osDark;
            },
            media: '(prefers-color-scheme: dark)',
            addEventListener: (
                _type: string,
                handler: (e: MediaQueryListEvent) => void,
            ) => {
                handlers.push(handler);
            },
            removeEventListener: (
                _type: string,
                handler: (e: MediaQueryListEvent) => void,
            ) => {
                const index = handlers.indexOf(handler);
                if (index >= 0) handlers.splice(index, 1);
            },
        }));
    });

    afterEach(() => {
        handlers.length = 0;
        document.documentElement.classList.remove('dark');
        vi.unstubAllGlobals();
    });

    it('applies light theme on document when selecting light from system+dark OS', async () => {
        osDark = true;
        const onPreferenceChange = vi.fn();

        render(
            <ThemeSettingsHarness
                preference="system"
                onPreferenceChange={onPreferenceChange}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
        await userEvent.click(screen.getByRole('radio', { name: 'Light' }));

        expect(onPreferenceChange).toHaveBeenCalledWith('light');
        await waitFor(() => {
            expect(document.documentElement.classList.contains('dark')).toBe(
                false,
            );
        });
    });

    it('applies dark theme on document when selecting dark', async () => {
        osDark = false;
        const onPreferenceChange = vi.fn();

        render(
            <ThemeSettingsHarness
                preference="light"
                onPreferenceChange={onPreferenceChange}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
        await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));

        expect(onPreferenceChange).toHaveBeenCalledWith('dark');
        await waitFor(() => {
            expect(document.documentElement.classList.contains('dark')).toBe(
                true,
            );
        });
    });

    it('applies blue accent CSS variables when selecting blue in settings', async () => {
        render(
            <ThemeSettingsHarness
                preference="light"
                accentColor="teal"
                onPreferenceChange={vi.fn()}
                onAccentColorChange={vi.fn()}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
        await userEvent.click(screen.getByRole('radio', { name: 'Blue' }));

        await waitFor(() => {
            expect(
                document.documentElement.style.getPropertyValue(
                    '--color-accent',
                ),
            ).toBe('#2563eb');
        });
    });
});
