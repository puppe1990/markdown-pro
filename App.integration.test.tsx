import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App tab selection', () => {
    beforeEach(() => {
        localStorage.clear();
        window.matchMedia = vi.fn().mockReturnValue({
            matches: false,
            media: '',
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        });
    });

    it('shows the selected last tab content instead of falling back to the first tab', async () => {
        const user = userEvent.setup();

        render(<App />);

        const textbox = screen.getByRole('textbox');
        await user.type(textbox, 'tab1');

        await user.click(screen.getByRole('button', { name: /add tab/i }));
        expect(screen.getByRole('textbox')).toHaveValue('');
        await user.type(screen.getByRole('textbox'), 'tab2');

        await user.click(screen.getByRole('button', { name: /add tab/i }));
        expect(screen.getByRole('textbox')).toHaveValue('');
        await user.type(screen.getByRole('textbox'), 'tab3');

        await user.click(screen.getByRole('button', { name: /add tab/i }));
        expect(screen.getByRole('textbox')).toHaveValue('');

        await user.click(screen.getByText('Untitled'));
        expect(screen.getByRole('textbox')).toHaveValue('tab1');

        await user.click(screen.getByText('Untitled 4'));
        expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('closes the first tab after selecting it', async () => {
        const user = userEvent.setup();

        render(<App />);

        await user.type(screen.getByRole('textbox'), 'tab1');
        await user.click(screen.getByRole('button', { name: /add tab/i }));
        await user.type(screen.getByRole('textbox'), 'tab2');

        await user.click(screen.getByText('Untitled'));
        window.confirm = vi.fn(() => true);

        await user.click(
            screen.getAllByRole('button', { name: /close tab/i })[0],
        );

        expect(screen.queryByText('Untitled')).not.toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveValue('tab2');
    });
});
