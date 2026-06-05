import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconTooltipButton } from './IconTooltipButton';

describe('IconTooltipButton', () => {
    it('exposes tooltip text as accessible name and tooltip content', () => {
        render(
            <IconTooltipButton tooltip="Version History" onClick={vi.fn()}>
                <span data-testid="icon" />
            </IconTooltipButton>,
        );

        expect(
            screen.getByRole('button', { name: 'Version History' }),
        ).toBeTruthy();
        expect(screen.getByRole('tooltip')).toHaveTextContent(
            'Version History',
        );
    });

    it('calls onClick when activated', async () => {
        const onClick = vi.fn();
        render(
            <IconTooltipButton tooltip="Import" onClick={onClick}>
                <span />
            </IconTooltipButton>,
        );

        await userEvent.click(screen.getByRole('button', { name: 'Import' }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
