import React, { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from './icons';

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
                className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200"
            >
                <div className="flex items-center justify-between px-6 pt-5 pb-2">
                    <h3
                        id="confirm-modal-title"
                        className="text-lg font-bold text-gray-900 dark:text-gray-100"
                    >
                        {title}
                    </h3>
                    <button
                        onClick={onCancel}
                        aria-label="close"
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
                <div className="px-6 pb-5 pt-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {message}
                    </p>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 pb-5">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-lg hover:from-red-600 hover:to-rose-600 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default ConfirmModal;
