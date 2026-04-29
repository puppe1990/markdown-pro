import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import { STORAGE_KEYS } from './constants/storage';

vi.mock('./components/Header', () => ({
    default: () => <div>Header</div>,
}));

vi.mock('./components/Preview', () => ({
    default: ({ markdown }: { markdown: string }) => <div data-testid="preview">{markdown}</div>,
}));

vi.mock('./components/VersionHistoryPanel', () => ({
    default: () => null,
}));

vi.mock('./components/Editor', () => ({
    default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
        <div>
            <div data-testid="editor-value">{value}</div>
            <button onClick={() => onChange('Texto da aba atual')}>change</button>
        </div>
    ),
}));

describe('App storage behavior', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        vi.useFakeTimers();
        vi.stubGlobal(
            'matchMedia',
            vi.fn().mockReturnValue({
                matches: false,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            })
        );
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('prefers session storage so each browser tab keeps its own text', () => {
        sessionStorage.setItem(STORAGE_KEYS.markdownContent, 'Texto da aba');
        localStorage.setItem(STORAGE_KEYS.markdownContent, 'Texto antigo compartilhado');

        render(<App />);

        expect(screen.getByTestId('editor-value')).toHaveTextContent('Texto da aba');
        expect(screen.getByTestId('preview')).toHaveTextContent('Texto da aba');
    });

    it('autosaves markdown to session storage without overwriting the shared local storage key', () => {
        localStorage.setItem(STORAGE_KEYS.markdownContent, 'Texto legado');

        render(<App />);
        fireEvent.click(screen.getByRole('button', { name: 'change' }));

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(sessionStorage.getItem(STORAGE_KEYS.markdownContent)).toBe('Texto da aba atual');
        expect(localStorage.getItem(STORAGE_KEYS.markdownContent)).toBe('Texto legado');
    });
});
