import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from './icons';
import { btnDanger, btnSecondary } from '@/src/lib/ui-classes';

interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const FOCUSABLE_SELECTOR =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const ConfirmModal: React.FC<Props> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel();
                return;
            }

            if (e.key === 'Tab' && dialogRef.current) {
                const focusable =
                    dialogRef.current.querySelectorAll<HTMLElement>(
                        FOCUSABLE_SELECTOR,
                    );
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        },
        [onCancel],
    );

    useEffect(() => {
        if (!isOpen) return;

        previousFocusRef.current = document.activeElement as HTMLElement | null;
        document.addEventListener('keydown', handleKeyDown);

        const focusable =
            dialogRef.current?.querySelectorAll<HTMLElement>(
                FOCUSABLE_SELECTOR,
            );
        const okButton = focusable?.[focusable.length - 1];
        okButton?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            previousFocusRef.current?.focus();
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                data-testid="modal-backdrop"
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onCancel}
            />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                className="relative bg-surface dark:bg-ink-900 rounded-2xl shadow-2xl border border-ink-border/50 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200"
            >
                <div className="flex items-center justify-between px-6 pt-5 pb-2">
                    <h3
                        id="confirm-modal-title"
                        className="text-lg font-bold text-ink dark:text-stone-100"
                    >
                        {title}
                    </h3>
                    <button
                        onClick={onCancel}
                        aria-label="close"
                        className="p-1.5 rounded-lg hover:bg-surface-muted dark:hover:bg-ink-800 transition-colors text-ink-faint hover:text-ink-muted"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
                <div className="px-6 pb-5 pt-1">
                    <p className="text-sm text-ink-muted leading-relaxed">
                        {message}
                    </p>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 pb-5">
                    <button onClick={onCancel} className={btnSecondary}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} className={btnDanger}>
                        OK
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default ConfirmModal;
