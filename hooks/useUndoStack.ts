import { useCallback, useRef, useState } from 'react';

const MAX_STACK_ENTRIES = 100;

/**
 * Per-tab undo history for markdown content.
 *
 * Call `recordChange` before applying an edit. Call `undo` to restore the
 * previous content (does not auto-record — apply the returned string yourself).
 *
 * Example:
 *   recordChange(tabId, current, next);
 *   setContent(next);
 *   // later:
 *   const prev = undo(tabId);
 *   if (prev !== null) setContent(prev);
 */
export function useUndoStack(activeTabId: string | undefined) {
    const stacksRef = useRef<Record<string, string[]>>({});
    // Lengths are state so canUndo can be derived during render without reading refs.
    const [stackLengths, setStackLengths] = useState<Record<string, number>>(
        {},
    );

    const recordChange = useCallback(
        (tabId: string, previousContent: string, nextContent: string) => {
            if (previousContent === nextContent) return;

            const stack = [
                ...(stacksRef.current[tabId] ?? []),
                previousContent,
            ];
            if (stack.length > MAX_STACK_ENTRIES) {
                stack.splice(0, stack.length - MAX_STACK_ENTRIES);
            }
            stacksRef.current = { ...stacksRef.current, [tabId]: stack };
            setStackLengths((prev) => ({ ...prev, [tabId]: stack.length }));
        },
        [],
    );

    const undo = useCallback((tabId: string): string | null => {
        const stack = stacksRef.current[tabId];
        if (!stack || stack.length === 0) return null;

        const previous = stack[stack.length - 1];
        const nextStack = stack.slice(0, -1);
        stacksRef.current = { ...stacksRef.current, [tabId]: nextStack };
        setStackLengths((prev) => ({ ...prev, [tabId]: nextStack.length }));
        return previous;
    }, []);

    const canUndo = !!activeTabId && (stackLengths[activeTabId] ?? 0) > 0;

    return { recordChange, undo, canUndo };
}
