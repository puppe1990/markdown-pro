import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SavedDocumentsPanel from './SavedDocumentsPanel';
import type { SavedTab } from '@/src/features/tabs/tabs.functions';

const savedTabs: SavedTab[] = [
    {
        id: 'tab-1',
        name: 'Meeting Notes',
        content: '# Agenda',
        isOpen: true,
        updatedAt: '2026-06-01T10:00:00',
    },
    {
        id: 'tab-2',
        name: 'Draft',
        content: 'shopping list',
        isOpen: false,
        updatedAt: '2026-06-02T12:00:00',
    },
];

describe('SavedDocumentsPanel', () => {
    const onClose = vi.fn();
    const onOpen = vi.fn();
    const onDelete = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('filters documents by search query', async () => {
        render(
            <SavedDocumentsPanel
                tabs={savedTabs}
                onClose={onClose}
                onOpen={onOpen}
                onDelete={onDelete}
            />,
        );

        await userEvent.type(
            screen.getByRole('searchbox', { name: /search documents/i }),
            'shopping',
        );

        expect(screen.getByText('Draft')).toBeInTheDocument();
        expect(screen.queryByText('Meeting Notes')).not.toBeInTheDocument();
    });

    it('calls onOpen when the document row is clicked', async () => {
        render(
            <SavedDocumentsPanel
                tabs={savedTabs}
                onClose={onClose}
                onOpen={onOpen}
                onDelete={onDelete}
            />,
        );

        await userEvent.click(
            screen.getByRole('button', { name: /open draft/i }),
        );

        expect(onOpen).toHaveBeenCalledWith('tab-2');
    });

    it('confirms before deleting a document', async () => {
        render(
            <SavedDocumentsPanel
                tabs={savedTabs}
                onClose={onClose}
                onOpen={onOpen}
                onDelete={onDelete}
            />,
        );

        await userEvent.click(
            screen.getByRole('button', { name: /delete meeting notes/i }),
        );

        expect(
            screen.getByText(/delete this document permanently/i),
        ).toBeInTheDocument();
        expect(onDelete).not.toHaveBeenCalled();

        await userEvent.click(screen.getByRole('button', { name: /^ok$/i }));
        expect(onDelete).toHaveBeenCalledWith('tab-1');
    });
});
