import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutosave } from './useAutosave';

describe('useAutosave', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('persists drafts to localStorage after the debounce delay', () => {
        renderHook(() => useAutosave('# Latest draft', 1000));

        vi.advanceTimersByTime(999);
        expect(localStorage.getItem('markdown-content')).toBeNull();

        vi.advanceTimersByTime(1);
        expect(localStorage.getItem('markdown-content')).toBe('# Latest draft');
    });
});
