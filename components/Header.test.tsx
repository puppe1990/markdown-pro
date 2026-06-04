import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from './Header';

vi.mock('../services/exportService', () => ({
    exportAsMarkdown: vi.fn(),
    exportAsPdf: vi.fn(),
    exportAsDocx: vi.fn(),
}));

describe('Header', () => {
    it('renders the export menu above surrounding layout layers', async () => {
        const { container } = render(
            <Header
                theme="dark"
                toggleTheme={vi.fn()}
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
            screen.getByRole('button', { name: /^export$/i }),
        );

        const exportMenu = screen.getByText('Markdown (.md)').closest('div');
        expect(exportMenu).toBeTruthy();
        expect(exportMenu?.className).toContain('absolute');
        expect(exportMenu?.className).toContain('z-50');
    });

    it('shows saved checkmark when syncStatus is saved', () => {
        render(
            <Header
                theme="light"
                toggleTheme={vi.fn()}
                onHistoryClick={vi.fn()}
                onReadingModeToggle={vi.fn()}
                isReadingMode={false}
                markdownContent=""
                onImportMarkdown={vi.fn()}
                syncStatus="saved"
            />,
        );

        expect(screen.getByTitle('All changes saved')).toBeTruthy();
    });

    it('shows save icon when syncStatus is pending', () => {
        render(
            <Header
                theme="light"
                toggleTheme={vi.fn()}
                onHistoryClick={vi.fn()}
                onReadingModeToggle={vi.fn()}
                isReadingMode={false}
                markdownContent=""
                onImportMarkdown={vi.fn()}
                syncStatus="pending"
            />,
        );

        expect(screen.getByTitle('Save changes')).toBeTruthy();
    });

    it('calls onSyncClick when sync button is clicked and status is pending', async () => {
        const onSyncClick = vi.fn();

        render(
            <Header
                theme="light"
                toggleTheme={vi.fn()}
                onHistoryClick={vi.fn()}
                onReadingModeToggle={vi.fn()}
                isReadingMode={false}
                markdownContent=""
                onImportMarkdown={vi.fn()}
                syncStatus="pending"
                onSyncClick={onSyncClick}
            />,
        );

        await userEvent.click(screen.getByTitle('Save changes'));
        expect(onSyncClick).toHaveBeenCalledTimes(1);
    });

    it('does not show sync button when syncStatus is not provided', () => {
        render(
            <Header
                theme="light"
                toggleTheme={vi.fn()}
                onHistoryClick={vi.fn()}
                onReadingModeToggle={vi.fn()}
                isReadingMode={false}
                markdownContent=""
                onImportMarkdown={vi.fn()}
            />,
        );

        expect(screen.queryByTitle('All changes saved')).not.toBeTruthy();
        expect(screen.queryByTitle('Save changes')).not.toBeTruthy();
    });
});
