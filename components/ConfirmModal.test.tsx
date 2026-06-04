import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmModal from './ConfirmModal';

describe('ConfirmModal', () => {
    it('renders nothing when isOpen is false', () => {
        render(
            <ConfirmModal
                isOpen={false}
                title="Close tab?"
                message="You have unsaved changes."
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
            />,
        );
        expect(screen.queryByText('Close tab?')).not.toBeInTheDocument();
    });

    it('renders title and message when isOpen is true', () => {
        render(
            <ConfirmModal
                isOpen={true}
                title="Close tab?"
                message="You have unsaved changes."
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
            />,
        );
        expect(screen.getByText('Close tab?')).toBeInTheDocument();
        expect(
            screen.getByText('You have unsaved changes.'),
        ).toBeInTheDocument();
    });

    it('calls onCancel when Cancel button is clicked', async () => {
        const onCancel = vi.fn();
        render(
            <ConfirmModal
                isOpen={true}
                title="Close tab?"
                message="You have unsaved changes."
                onConfirm={vi.fn()}
                onCancel={onCancel}
            />,
        );
        await userEvent.click(screen.getByText('Cancel'));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when OK button is clicked', async () => {
        const onConfirm = vi.fn();
        render(
            <ConfirmModal
                isOpen={true}
                title="Close tab?"
                message="You have unsaved changes."
                onConfirm={onConfirm}
                onCancel={vi.fn()}
            />,
        );
        await userEvent.click(screen.getByText('OK'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when backdrop is clicked', async () => {
        const onCancel = vi.fn();
        render(
            <ConfirmModal
                isOpen={true}
                title="Close tab?"
                message="You have unsaved changes."
                onConfirm={vi.fn()}
                onCancel={onCancel}
            />,
        );
        const backdrop = screen.getByTestId('modal-backdrop');
        await userEvent.click(backdrop);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when Enter key is pressed', async () => {
        const onConfirm = vi.fn();
        render(
            <ConfirmModal
                isOpen={true}
                title="Close tab?"
                message="You have unsaved changes."
                onConfirm={onConfirm}
                onCancel={vi.fn()}
            />,
        );
        await userEvent.keyboard('{Enter}');
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Escape key is pressed', async () => {
        const onCancel = vi.fn();
        render(
            <ConfirmModal
                isOpen={true}
                title="Close tab?"
                message="You have unsaved changes."
                onConfirm={vi.fn()}
                onCancel={onCancel}
            />,
        );
        await userEvent.keyboard('{Escape}');
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
