import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from './icons';

interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<Props> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
}) => {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Enter') onConfirm();
            if (e.key === 'Escape') onCancel();
        },
        [onConfirm, onCancel],
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                data-testid="modal-backdrop"
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onCancel}
            />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-gray-700/60 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
                <div className="flex items-center justify-between px-6 pt-5 pb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
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
