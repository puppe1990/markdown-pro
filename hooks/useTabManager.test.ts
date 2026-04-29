import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTabManager } from './useTabManager';

describe('useTabManager', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    const loadFreshUseTabManager = async () => {
        vi.resetModules();
        return (await import('./useTabManager')).useTabManager;
    };

    it('loads saved tabs from localStorage', () => {
        localStorage.setItem(
            'markdown-tabs',
            JSON.stringify([
                { id: 'saved-1', name: 'Saved', content: '# Persisted' },
                { id: 'saved-2', name: 'Draft', content: 'Body' },
            ]),
        );

        const { result } = renderHook(() => useTabManager());

        expect(result.current.tabs).toHaveLength(2);
        expect(result.current.tabs[0]).toEqual({
            id: 'saved-1',
            name: 'Saved',
            content: '# Persisted',
        });
        expect(result.current.tabs[1]).toEqual({
            id: 'saved-2',
            name: 'Draft',
            content: 'Body',
        });
    });

    it('restores the saved active tab id', () => {
        localStorage.setItem(
            'markdown-tabs',
            JSON.stringify([
                { id: 'saved-1', name: 'Saved', content: '# Persisted' },
                { id: 'saved-2', name: 'Draft', content: 'Body' },
            ]),
        );
        localStorage.setItem('markdown-active-tab-id', 'saved-2');

        const { result } = renderHook(() => useTabManager());

        expect(result.current.activeTabId).toBe('saved-2');
        expect(result.current.activeTab.id).toBe('saved-2');
    });

    it('starts with one default tab', () => {
        const { result } = renderHook(() => useTabManager());
        expect(result.current.tabs).toHaveLength(1);
        expect(result.current.tabs[0].name).toBe('Untitled');
        expect(result.current.tabs[0].content).toBe('');
        expect(result.current.activeTabId).toBe(result.current.tabs[0].id);
    });

    it('adds a new tab', () => {
        const { result } = renderHook(() => useTabManager());
        act(() => {
            result.current.updateTabContent(
                result.current.activeTabId,
                '# First',
            );
        });

        act(() => {
            result.current.addTab();
        });

        expect(result.current.tabs).toHaveLength(2);
        expect(result.current.tabs[1].name).toBe('Untitled 2');
        expect(result.current.activeTabId).toBe(result.current.tabs[1].id);
        expect(result.current.activeTab.content).toBe('');
    });

    it('creates a unique id after restoring saved tabs', async () => {
        localStorage.setItem(
            'markdown-tabs',
            JSON.stringify([{ id: 'tab-1', name: 'Saved', content: '# Note' }]),
        );

        const freshUseTabManager = await loadFreshUseTabManager();
        const { result } = renderHook(() => freshUseTabManager());

        act(() => {
            result.current.addTab();
        });

        expect(result.current.tabs[1].id).toBe('tab-2');
    });

    it('switches active tab', () => {
        const { result } = renderHook(() => useTabManager());
        act(() => {
            result.current.addTab();
        });
        const secondId = result.current.tabs[1].id;
        act(() => {
            result.current.setActiveTabId(secondId);
        });
        expect(result.current.activeTabId).toBe(secondId);
    });

    it('renames a tab', () => {
        const { result } = renderHook(() => useTabManager());
        const id = result.current.tabs[0].id;
        act(() => {
            result.current.renameTab(id, 'My Notes');
        });
        expect(result.current.tabs[0].name).toBe('My Notes');
    });

    it('updates content of active tab', () => {
        const { result } = renderHook(() => useTabManager());
        const id = result.current.tabs[0].id;
        act(() => {
            result.current.updateTabContent(id, '# Hello');
        });
        expect(result.current.tabs[0].content).toBe('# Hello');
    });

    it('closes a tab and switches to next available', () => {
        const { result } = renderHook(() => useTabManager());
        act(() => {
            result.current.addTab();
        });
        const firstId = result.current.tabs[0].id;
        const secondId = result.current.tabs[1].id;
        act(() => {
            result.current.setActiveTabId(firstId);
        });
        act(() => {
            result.current.closeTab(firstId);
        });
        expect(result.current.tabs).toHaveLength(1);
        expect(result.current.activeTabId).toBe(secondId);
    });

    it('cannot close last tab', () => {
        const { result } = renderHook(() => useTabManager());
        const id = result.current.tabs[0].id;
        act(() => {
            result.current.closeTab(id);
        });
        expect(result.current.tabs).toHaveLength(1);
    });

    it('keeps one tab after closing a restored tab with a new tab added', async () => {
        localStorage.setItem(
            'markdown-tabs',
            JSON.stringify([{ id: 'tab-1', name: 'Saved', content: '# Note' }]),
        );

        const freshUseTabManager = await loadFreshUseTabManager();
        const { result } = renderHook(() => freshUseTabManager());

        act(() => {
            result.current.addTab();
        });

        act(() => {
            result.current.closeTab('tab-1');
        });

        expect(result.current.tabs).toHaveLength(1);
        expect(result.current.tabs[0].id).toBe('tab-2');
        expect(result.current.activeTabId).toBe('tab-2');
    });

    it('active tab content reflects current tab', () => {
        const { result } = renderHook(() => useTabManager());
        act(() => {
            result.current.addTab();
        });
        const secondId = result.current.tabs[1].id;
        act(() => {
            result.current.updateTabContent(secondId, '# Tab 2');
        });
        act(() => {
            result.current.setActiveTabId(secondId);
        });
        expect(result.current.activeTab.content).toBe('# Tab 2');
    });

    it('keeps the last tab active when selecting it after creating multiple tabs', () => {
        const { result } = renderHook(() => useTabManager());

        act(() => {
            result.current.updateTabContent(
                result.current.activeTabId,
                '# Tab 1',
            );
        });

        act(() => {
            result.current.addTab();
        });
        act(() => {
            result.current.updateTabContent(
                result.current.activeTabId,
                '# Tab 2',
            );
        });

        act(() => {
            result.current.addTab();
        });
        act(() => {
            result.current.updateTabContent(
                result.current.activeTabId,
                '# Tab 3',
            );
        });

        act(() => {
            result.current.addTab();
        });
        const lastTabId = result.current.activeTabId;

        act(() => {
            result.current.updateTabContent(lastTabId, '# Tab 4');
        });

        act(() => {
            result.current.setActiveTabId(lastTabId);
        });

        expect(result.current.activeTabId).toBe(lastTabId);
        expect(result.current.activeTab.content).toBe('# Tab 4');
    });

    it('restores the first tab when active tab id becomes invalid', async () => {
        const { result } = renderHook(() => useTabManager());

        act(() => {
            result.current.setActiveTabId('missing-tab');
        });

        await waitFor(() => {
            expect(result.current.activeTabId).toBe(result.current.tabs[0].id);
        });

        expect(result.current.activeTab).toBe(result.current.tabs[0]);
    });
});
