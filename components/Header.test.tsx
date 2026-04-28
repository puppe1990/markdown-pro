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
});
