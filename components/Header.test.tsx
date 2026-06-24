import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './Header';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock('../services/exportService', () => ({
    exportAsMarkdown: vi.fn(),
    exportAsPdf: vi.fn(),
    exportAsDocx: vi.fn(),
}));

describe('Header', () => {
    it('renders the export menu above surrounding layout layers', async () => {
        const { container } = render(
            <Header
                themePreference="dark"
                onThemePreferenceChange={vi.fn()}
                accentColor="teal"
                onAccentColorChange={vi.fn()}
                onHistoryClick={vi.fn()}
                onReadingModeToggle={vi.fn()}
                isReadingMode={false}
                markdownContent="# Title"
                onImportMarkdown={vi.fn()}
                tabName="Notes"
            />,
        );

        const header = container.querySelector('header');
        expect(header).toBeTruthy();
        expect(header?.className).toContain('relative');
        expect(header?.className).toContain('z-20');

        await userEvent.click(
            screen.getByRole('button', { name: /export document/i }),
        );

        const exportMenu = screen.getByText('Markdown (.md)').closest('div');
        expect(exportMenu).toBeTruthy();
        expect(exportMenu?.className).toContain('absolute');
        expect(exportMenu?.className).toContain('z-50');
    });

    it('shows saved checkmark when syncStatus is saved', () => {
        render(
            <Header
                themePreference="light"
                onThemePreferenceChange={vi.fn()}
                accentColor="teal"
                onAccentColorChange={vi.fn()}
                onHistoryClick={vi.fn()}
                onReadingModeToggle={vi.fn()}
                isReadingMode={false}
                markdownContent=""
                onImportMarkdown={vi.fn()}
                syncStatus="saved"
            />,
        );

        expect(
            screen.getByRole('button', { name: 'All changes saved' }),
        ).toBeTruthy();
    });

    it('shows save icon when syncStatus is pending', () => {
        render(
            <Header
                themePreference="light"
                onThemePreferenceChange={vi.fn()}
                accentColor="teal"
                onAccentColorChange={vi.fn()}
                onHistoryClick={vi.fn()}
                onReadingModeToggle={vi.fn()}
                isReadingMode={false}
                markdownContent=""
                onImportMarkdown={vi.fn()}
                syncStatus="pending"
            />,
        );

        expect(
            screen.getByRole('button', { name: 'Save changes' }),
        ).toBeTruthy();
    });

    it('calls onSyncClick when sync button is clicked and status is pending', async () => {
        const onSyncClick = vi.fn();

        render(
            <Header
                themePreference="light"
                onThemePreferenceChange={vi.fn()}
                accentColor="teal"
                onAccentColorChange={vi.fn()}
                onHistoryClick={vi.fn()}
                onReadingModeToggle={vi.fn()}
                isReadingMode={false}
                markdownContent=""
                onImportMarkdown={vi.fn()}
                syncStatus="pending"
                onSyncClick={onSyncClick}
            />,
        );

        await userEvent.click(
            screen.getByRole('button', { name: 'Save changes' }),
        );
        expect(onSyncClick).toHaveBeenCalledTimes(1);
    });

    it('does not show sync button when syncStatus is not provided', () => {
        render(
            <Header
                themePreference="light"
                onThemePreferenceChange={vi.fn()}
                accentColor="teal"
                onAccentColorChange={vi.fn()}
                onHistoryClick={vi.fn()}
                onReadingModeToggle={vi.fn()}
                isReadingMode={false}
                markdownContent=""
                onImportMarkdown={vi.fn()}
            />,
        );

        expect(
            screen.queryByRole('button', { name: 'All changes saved' }),
        ).not.toBeTruthy();
        expect(
            screen.queryByRole('button', { name: 'Save changes' }),
        ).not.toBeTruthy();
    });

    it('opens settings modal with theme options when settings button is clicked', async () => {
        render(
            <Header
                themePreference="system"
                onThemePreferenceChange={vi.fn()}
                accentColor="teal"
                onAccentColorChange={vi.fn()}
                onHistoryClick={vi.fn()}
                onReadingModeToggle={vi.fn()}
                isReadingMode={false}
                markdownContent=""
                onImportMarkdown={vi.fn()}
            />,
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

        expect(
            screen.getByRole('dialog', { name: 'Settings' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();
    });

    it('calls onThemePreferenceChange when selecting theme in settings modal', async () => {
        const onThemePreferenceChange = vi.fn();
        const onAccentColorChange = vi.fn();

        render(
            <Header
                themePreference="system"
                onThemePreferenceChange={onThemePreferenceChange}
                accentColor="teal"
                onAccentColorChange={onAccentColorChange}
                onHistoryClick={vi.fn()}
                onReadingModeToggle={vi.fn()}
                isReadingMode={false}
                markdownContent=""
                onImportMarkdown={vi.fn()}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
        await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));

        expect(onThemePreferenceChange).toHaveBeenCalledWith('dark');
    });
});
