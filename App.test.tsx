import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

const useTabManagerMock = vi.fn();
const useVersionHistoryMock = vi.fn();

vi.mock('./hooks/useTabManager', () => ({
    useTabManager: () => useTabManagerMock(),
}));

vi.mock('./hooks/useVersionHistory', () => ({
    useVersionHistory: (setMarkdown: (content: string) => void) =>
        useVersionHistoryMock(setMarkdown),
}));

describe('App', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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

        useVersionHistoryMock.mockReturnValue({
            versions: [],
            saveVersion: vi.fn(),
        });
    });

    it('renders safely when no active tab is available', () => {
        useTabManagerMock.mockReturnValue({
            tabs: [{ id: 'tab-1', name: 'Notes', content: '# Hello' }],
            activeTabId: 'missing-tab',
            activeTab: undefined,
            setActiveTabId: vi.fn(),
            addTab: vi.fn(),
            closeTab: vi.fn(),
            renameTab: vi.fn(),
            updateTabContent: vi.fn(),
        });

        render(<App />);

        expect(screen.getByText('Markdown')).toBeInTheDocument();
    });

    it('focuses the editor when the active tab changes', () => {
        const setActiveTabId = vi.fn();
        const baseState = {
            tabs: [
                { id: 'tab-1', name: 'Notes', content: '# Hello' },
                { id: 'tab-2', name: 'Draft', content: '' },
            ],
            setActiveTabId,
            addTab: vi.fn(),
            closeTab: vi.fn(),
            renameTab: vi.fn(),
            updateTabContent: vi.fn(),
        };

        useTabManagerMock
            .mockReturnValueOnce({
                ...baseState,
                activeTabId: 'tab-1',
                activeTab: baseState.tabs[0],
            })
            .mockReturnValueOnce({
                ...baseState,
                activeTabId: 'tab-2',
                activeTab: baseState.tabs[1],
            });

        const { rerender } = render(<App />);

        rerender(<App />);

        expect(screen.getByRole('textbox')).toHaveFocus();
    });
});
