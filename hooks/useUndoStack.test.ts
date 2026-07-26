import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useUndoStack } from './useUndoStack';

describe('useUndoStack', () => {
    it('starts with canUndo false', () => {
        const { result } = renderHook(() => useUndoStack('tab-1'));
        expect(result.current.canUndo).toBe(false);
    });

    it('records a change and allows undo to previous content', () => {
        const { result } = renderHook(() => useUndoStack('tab-1'));

        act(() => {
            result.current.recordChange('tab-1', 'hello', 'hello world');
        });

        expect(result.current.canUndo).toBe(true);

        let restored: string | null = null;
        act(() => {
            restored = result.current.undo('tab-1');
        });

        expect(restored).toBe('hello');
        expect(result.current.canUndo).toBe(false);
    });

    it('ignores no-op changes', () => {
        const { result } = renderHook(() => useUndoStack('tab-1'));

        act(() => {
            result.current.recordChange('tab-1', 'same', 'same');
        });

        expect(result.current.canUndo).toBe(false);
        expect(result.current.undo('tab-1')).toBeNull();
    });

    it('keeps stacks isolated per tab', () => {
        const { result, rerender } = renderHook(
            ({ tabId }: { tabId: string }) => useUndoStack(tabId),
            { initialProps: { tabId: 'tab-a' } },
        );

        act(() => {
            result.current.recordChange('tab-a', 'A0', 'A1');
            result.current.recordChange('tab-b', 'B0', 'B1');
        });

        expect(result.current.canUndo).toBe(true);

        rerender({ tabId: 'tab-b' });
        expect(result.current.canUndo).toBe(true);

        let restored: string | null = null;
        act(() => {
            restored = result.current.undo('tab-b');
        });
        expect(restored).toBe('B0');
        expect(result.current.canUndo).toBe(false);

        rerender({ tabId: 'tab-a' });
        expect(result.current.canUndo).toBe(true);
        act(() => {
            restored = result.current.undo('tab-a');
        });
        expect(restored).toBe('A0');
    });

    it('returns null when stack is empty', () => {
        const { result } = renderHook(() => useUndoStack('tab-1'));
        expect(result.current.undo('tab-1')).toBeNull();
    });

    it('canUndo is false when activeTabId is undefined', () => {
        const { result } = renderHook(() => useUndoStack(undefined));

        act(() => {
            result.current.recordChange('tab-1', 'a', 'b');
        });

        expect(result.current.canUndo).toBe(false);
    });

    it('supports multiple undos in LIFO order', () => {
        const { result } = renderHook(() => useUndoStack('tab-1'));

        act(() => {
            result.current.recordChange('tab-1', 'v0', 'v1');
            result.current.recordChange('tab-1', 'v1', 'v2');
            result.current.recordChange('tab-1', 'v2', 'v3');
        });

        let restored: string | null = null;
        act(() => {
            restored = result.current.undo('tab-1');
        });
        expect(restored).toBe('v2');

        act(() => {
            restored = result.current.undo('tab-1');
        });
        expect(restored).toBe('v1');

        act(() => {
            restored = result.current.undo('tab-1');
        });
        expect(restored).toBe('v0');
        expect(result.current.canUndo).toBe(false);
    });
});
