import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import TabBar from './TabBar';
import { Tab } from '../hooks/useTabManager';

const tabs: Tab[] = [
    { id: '1', name: 'Notes', content: '# Hello' },
    { id: '2', name: 'Draft', content: '# Draft' },
];

function StatefulTabBar() {
    const [state, setState] = useState({
        tabs: [
            { id: '1', name: 'Notes', content: '# Hello' },
            { id: '2', name: 'Draft', content: '# Draft' },
        ] as Tab[],
        activeTabId: '1',
    });

    const handleAdd = () => {
        const newId = 'new-tab';
        setState((prev) => ({
            tabs: [
                ...prev.tabs,
                { id: newId, name: 'Untitled 3', content: '' },
            ],
            activeTabId: newId,
        }));
    };

    return (
        <TabBar
            tabs={state.tabs}
            activeTabId={state.activeTabId}
            onSelect={(id) =>
                setState((prev) => ({ ...prev, activeTabId: id }))
            }
            onAdd={handleAdd}
            onClose={vi.fn()}
            onRename={vi.fn()}
        />
    );
}

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

    it('shows confirm modal when closing a tab with content', async () => {
        const onClose = vi.fn();

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

        expect(
            screen.getByText(
                'This tab has content. Are you sure you want to close it?',
            ),
        ).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('closes tab when confirming in modal', async () => {
        const onClose = vi.fn();

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

        await userEvent.click(screen.getByText('OK'));
        expect(onClose).toHaveBeenCalledWith('1');
    });

    it('does not close tab when cancelling in modal', async () => {
        const onClose = vi.fn();

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

        await userEvent.click(screen.getByText('Cancel'));
        expect(onClose).not.toHaveBeenCalled();
    });

    it('closes without confirmation when tab is empty', async () => {
        const onClose = vi.fn();
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

        expect(onClose).toHaveBeenCalledWith('1');
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

    it('focuses the new tab button after clicking +', async () => {
        render(<StatefulTabBar />);
        await userEvent.click(screen.getByRole('button', { name: /add tab/i }));

        const newTab = screen.getByText('Untitled 3');
        expect(newTab.closest('[role="tab"]')).toHaveFocus();
    });
});
