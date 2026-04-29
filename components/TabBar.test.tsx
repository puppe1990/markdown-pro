import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TabBar from './TabBar';
import { Tab } from '../hooks/useTabManager';

const tabs: Tab[] = [
    { id: '1', name: 'Notes', content: '# Hello' },
    { id: '2', name: 'Draft', content: '# Draft' },
];

describe('TabBar', () => {
    it('renders all tab names', () => {
        render(
            <TabBar
                tabs={tabs}
                activeTabId="1"
                onSelect={vi.fn()}
                onAdd={vi.fn()}
                onClose={vi.fn()}
                onRename={vi.fn()}
            />,
        );
        expect(screen.getByText('Notes')).toBeInTheDocument();
        expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('calls onSelect when tab clicked', async () => {
        const onSelect = vi.fn();
        render(
            <TabBar
                tabs={tabs}
                activeTabId="1"
                onSelect={onSelect}
                onAdd={vi.fn()}
                onClose={vi.fn()}
                onRename={vi.fn()}
            />,
        );
        await userEvent.click(screen.getByText('Draft'));
        expect(onSelect).toHaveBeenCalledWith('2');
    });

    it('calls onAdd when + button clicked', async () => {
        const onAdd = vi.fn();
        render(
            <TabBar
                tabs={tabs}
                activeTabId="1"
                onSelect={vi.fn()}
                onAdd={onAdd}
                onClose={vi.fn()}
                onRename={vi.fn()}
            />,
        );
        await userEvent.click(screen.getByRole('button', { name: /add tab/i }));
        expect(onAdd).toHaveBeenCalled();
    });

    it('calls onClose when close button clicked', async () => {
        const onClose = vi.fn();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <TabBar
                tabs={tabs}
                activeTabId="1"
                onSelect={vi.fn()}
                onAdd={vi.fn()}
                onClose={onClose}
                onRename={vi.fn()}
            />,
        );
        const closeButtons = screen.getAllByRole('button', {
            name: /close tab/i,
        });
        await userEvent.click(closeButtons[0]);
        expect(confirmSpy).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalledWith('1');

        confirmSpy.mockRestore();
    });

    it('asks for confirmation before closing a tab with content', async () => {
        const onClose = vi.fn();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        render(
            <TabBar
                tabs={tabs}
                activeTabId="1"
                onSelect={vi.fn()}
                onAdd={vi.fn()}
                onClose={onClose}
                onRename={vi.fn()}
            />,
        );

        const closeButtons = screen.getAllByRole('button', {
            name: /close tab/i,
        });

        await userEvent.click(closeButtons[0]);

        expect(confirmSpy).toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();

        confirmSpy.mockRestore();
    });

    it('closes without confirmation when tab is empty', async () => {
        const onClose = vi.fn();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const emptyTabs: Tab[] = [
            { id: '1', name: 'Notes', content: '' },
            { id: '2', name: 'Draft', content: '# Draft' },
        ];

        render(
            <TabBar
                tabs={emptyTabs}
                activeTabId="1"
                onSelect={vi.fn()}
                onAdd={vi.fn()}
                onClose={onClose}
                onRename={vi.fn()}
            />,
        );

        const closeButtons = screen.getAllByRole('button', {
            name: /close tab/i,
        });

        await userEvent.click(closeButtons[0]);

        expect(confirmSpy).not.toHaveBeenCalled();
        expect(onClose).toHaveBeenCalledWith('1');

        confirmSpy.mockRestore();
    });

    it('enters rename mode on double-click and calls onRename on blur', async () => {
        const onRename = vi.fn();
        render(
            <TabBar
                tabs={tabs}
                activeTabId="1"
                onSelect={vi.fn()}
                onAdd={vi.fn()}
                onClose={vi.fn()}
                onRename={onRename}
            />,
        );
        await userEvent.dblClick(screen.getByText('Notes'));
        const input = screen.getByDisplayValue('Notes');
        await userEvent.clear(input);
        await userEvent.type(input, 'New Name');
        fireEvent.blur(input);
        expect(onRename).toHaveBeenCalledWith('1', 'New Name');
    });

    it('commits rename on Enter key', async () => {
        const onRename = vi.fn();
        render(
            <TabBar
                tabs={tabs}
                activeTabId="1"
                onSelect={vi.fn()}
                onAdd={vi.fn()}
                onClose={vi.fn()}
                onRename={onRename}
            />,
        );
        await userEvent.dblClick(screen.getByText('Notes'));
        const input = screen.getByDisplayValue('Notes');
        await userEvent.clear(input);
        await userEvent.type(input, 'Renamed{Enter}');
        expect(onRename).toHaveBeenCalledWith('1', 'Renamed');
    });
});
