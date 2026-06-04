import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedSync } from './useDebouncedSync';

const STORAGE_KEY = 'markdown-tabs';

describe('useDebouncedSync', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('saves content to localStorage after debounce delay', () => {
        const onSync = vi.fn().mockResolvedValue(undefined);

        renderHook(
            ({ content }) => useDebouncedSync('tab-1', content, onSync, 10000),
            { initialProps: { content: '# Hello' } },
        );

        act(() => {
            vi.advanceTimersByTime(149);
        });
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        const tabs = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(tabs).toContainEqual({ id: 'tab-1', content: '# Hello' });
    });

    it('sets syncStatus to pending after content is saved to localStorage', () => {
        const onSync = vi.fn().mockResolvedValue(undefined);

        const { result } = renderHook(
            ({ content }) => useDebouncedSync('tab-1', content, onSync, 10000),
            { initialProps: { content: '# Hello' } },
        );

        expect(result.current.syncStatus).toBe('saved');

        act(() => {
            vi.advanceTimersByTime(150);
        });
        expect(result.current.syncStatus).toBe('pending');
    });

    it('triggers onSync after delay of no content changes', () => {
        const onSync = vi.fn().mockResolvedValue(undefined);

        renderHook(
            ({ content }) => useDebouncedSync('tab-1', content, onSync, 10000),
            { initialProps: { content: '# Hello' } },
        );

        act(() => {
            vi.advanceTimersByTime(150);
        });
        expect(onSync).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(10000);
        });
        expect(onSync).toHaveBeenCalledWith('tab-1', '# Hello');
    });

    it('sets status to saving and then saved during successful sync', async () => {
        let resolveSync: () => void;
        const onSync = vi.fn().mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolveSync = resolve;
                }),
        );

        const { result } = renderHook(
            ({ content }) => useDebouncedSync('tab-1', content, onSync, 10000),
            { initialProps: { content: '# Hello' } },
        );

        act(() => {
            vi.advanceTimersByTime(150);
        });
        expect(result.current.syncStatus).toBe('pending');

        act(() => {
            vi.advanceTimersByTime(10000);
        });
        expect(result.current.syncStatus).toBe('saving');

        await act(async () => {
            resolveSync!();
        });

        expect(result.current.syncStatus).toBe('saved');
    });

    it('sets status to error when sync fails', async () => {
        const onSync = vi.fn().mockRejectedValue(new Error('network error'));

        const { result } = renderHook(
            ({ content }) => useDebouncedSync('tab-1', content, onSync, 10000),
            { initialProps: { content: '# Hello' } },
        );

        act(() => {
            vi.advanceTimersByTime(150);
        });

        act(() => {
            vi.advanceTimersByTime(10000);
        });

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        expect(result.current.syncStatus).toBe('error');
    });

    it('resets the sync timer when content changes', () => {
        const onSync = vi.fn().mockResolvedValue(undefined);

        const { rerender } = renderHook(
            ({ content }) => useDebouncedSync('tab-1', content, onSync, 10000),
            { initialProps: { content: '# Hello' } },
        );

        act(() => {
            vi.advanceTimersByTime(150);
        });

        act(() => {
            vi.advanceTimersByTime(5000);
        });
        rerender({ content: '# Hello World' });

        act(() => {
            vi.advanceTimersByTime(9999);
        });
        expect(onSync).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(onSync).toHaveBeenCalledWith('tab-1', '# Hello World');
    });

    it('manual syncNow saves current content immediately', async () => {
        const onSync = vi.fn().mockResolvedValue(undefined);

        const { result } = renderHook(
            ({ content }) => useDebouncedSync('tab-1', content, onSync, 10000),
            { initialProps: { content: '# Hello' } },
        );

        act(() => {
            vi.advanceTimersByTime(150);
        });

        await act(async () => {
            await result.current.syncNow();
        });

        expect(onSync).toHaveBeenCalledWith('tab-1', '# Hello');
        expect(result.current.syncStatus).toBe('saved');
    });

    it('updates only the active tab content in localStorage, keeping other tabs', () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify([
                { id: 'tab-1', name: 'Notes', content: '# Old' },
                { id: 'tab-2', name: 'Journal', content: '# Other' },
            ]),
        );

        const onSync = vi.fn().mockResolvedValue(undefined);

        renderHook(
            ({ content }) => useDebouncedSync('tab-1', content, onSync, 10000),
            { initialProps: { content: '# New' } },
        );

        act(() => {
            vi.advanceTimersByTime(150);
        });

        const tabs = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        expect(tabs).toHaveLength(2);
        expect(tabs).toContainEqual({
            id: 'tab-1',
            name: 'Notes',
            content: '# New',
        });
        expect(tabs).toContainEqual({
            id: 'tab-2',
            name: 'Journal',
            content: '# Other',
        });
    });

    it('syncs empty content when user clears a document', () => {
        const onSync = vi.fn().mockResolvedValue(undefined);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify([{ id: 'tab-1', name: 'Notes', content: '# Old' }]),
        );

        renderHook(
            ({ content }) => useDebouncedSync('tab-1', content, onSync, 10000),
            { initialProps: { content: '' } },
        );

        act(() => {
            vi.advanceTimersByTime(150);
        });

        act(() => {
            vi.advanceTimersByTime(10000);
        });

        expect(onSync).toHaveBeenCalledWith('tab-1', '');
    });

    it('syncs the originally edited tab when user switches tabs before debounce timer fires', () => {
        const onSync = vi.fn().mockResolvedValue(undefined);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify([
                { id: 'tab-a', name: 'Tab A', content: '# Tab A old' },
                { id: 'tab-b', name: 'Tab B', content: '# Tab B old' },
            ]),
        );

        const { rerender } = renderHook(
            ({ tabId, content }) =>
                useDebouncedSync(tabId, content, onSync, 10000),
            { initialProps: { tabId: 'tab-a', content: '# Tab A edited' } },
        );

        act(() => {
            vi.advanceTimersByTime(150);
        });

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        rerender({ tabId: 'tab-b', content: '# Tab B old' });

        act(() => {
            vi.advanceTimersByTime(10150);
        });

        expect(onSync).toHaveBeenCalledWith('tab-a', '# Tab A edited');
        expect(onSync).toHaveBeenCalledTimes(2);
    });

    it('prevents concurrent syncs when syncNow is called multiple times', async () => {
        const onSync = vi.fn().mockResolvedValue(undefined);

        const { result } = renderHook(
            ({ content }) => useDebouncedSync('tab-1', content, onSync, 10000),
            { initialProps: { content: '# Hello' } },
        );

        act(() => {
            vi.advanceTimersByTime(150);
        });

        act(() => {
            result.current.syncNow();
        });

        await act(async () => {
            await result.current.syncNow();
        });

        expect(onSync).toHaveBeenCalledTimes(1);
    });

    it('cleans up timers on unmount', () => {
        const onSync = vi.fn().mockResolvedValue(undefined);

        const { unmount } = renderHook(
            ({ content }) => useDebouncedSync('tab-1', content, onSync, 10000),
            { initialProps: { content: '# Hello' } },
        );

        act(() => {
            vi.advanceTimersByTime(150);
        });
        unmount();

        act(() => {
            vi.advanceTimersByTime(10000);
        });
        expect(onSync).not.toHaveBeenCalled();
    });
});
