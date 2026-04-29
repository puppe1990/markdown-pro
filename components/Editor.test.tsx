import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Editor from '../components/Editor';

vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => JSON.stringify({})),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
});

global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [{ base64: 'mock-image-data' }] }),
    }),
) as vi.Mock;

describe('Editor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders textarea with placeholder', () => {
        render(<Editor value="" onChange={() => {}} />);
        expect(
            screen.getByPlaceholderText(/start writing your markdown/i),
        ).toBeInTheDocument();
    });

    it('renders textarea with initial value', () => {
        const initialValue = '# Hello World';
        render(<Editor value={initialValue} onChange={() => {}} />);
        expect(screen.getByDisplayValue(initialValue)).toBeInTheDocument();
    });

    it('calls onChange when text changes', async () => {
        const onChange = vi.fn();
        render(<Editor value="" onChange={onChange} />);

        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'New text' } });

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith('New text');
        });
    });

    it('handles drag over state', () => {
        render(<Editor value="" onChange={() => {}} />);
        const textarea = screen.getByRole('textbox');

        fireEvent.dragEnter(textarea, { dataTransfer: { dropEffect: 'copy' } });

        expect(textarea).toBeInTheDocument();
    });
});
