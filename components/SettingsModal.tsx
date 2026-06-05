import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from './icons';
import type { ThemePreference } from '@/src/features/preferences/theme';
import {
    ACCENT_COLOR_OPTIONS,
    type AccentColorId,
} from '@/src/features/preferences/accent';

interface SettingsModalProps {
    isOpen: boolean;
    themePreference: ThemePreference;
    onThemePreferenceChange: (preference: ThemePreference) => void;
    accentColor: AccentColorId;
    onAccentColorChange: (accentColor: AccentColorId) => void;
    onClose: () => void;
}

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    themePreference,
    onThemePreferenceChange,
    accentColor,
    onAccentColorChange,
    onClose,
}) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        },
        [onClose],
    );

    useEffect(() => {
        if (!isOpen) return;

        previousFocusRef.current = document.activeElement as HTMLElement | null;
        document.addEventListener('keydown', handleKeyDown);

        const firstRadio = dialogRef.current?.querySelector<HTMLElement>(
            'input[type="radio"]',
        );
        firstRadio?.focus();

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
                onClick={onClose}
            />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-modal-title"
                className="relative bg-surface dark:bg-ink-900 rounded-2xl shadow-2xl border border-ink-border/50 w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-200"
            >
                <div className="flex items-center justify-between px-6 pt-5 pb-2">
                    <h3
                        id="settings-modal-title"
                        className="text-lg font-bold text-ink dark:text-stone-100"
                    >
                        Settings
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="close"
                        className="p-1.5 rounded-lg hover:bg-surface-muted dark:hover:bg-ink-800 transition-colors text-ink-faint hover:text-ink-muted"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
                <div className="px-6 pb-6 pt-1 space-y-6">
                    <fieldset>
                        <legend className="text-sm font-semibold text-ink dark:text-stone-200 mb-3">
                            Accent color
                        </legend>
                        <div
                            role="radiogroup"
                            aria-label="Accent color"
                            className="grid grid-cols-3 gap-2"
                        >
                            {ACCENT_COLOR_OPTIONS.map(
                                ({ id, label, swatch }) => (
                                    <label
                                        key={id}
                                        className="flex flex-col items-center gap-2 px-2 py-3 rounded-lg border border-ink-border/40 dark:border-ink-border-dark/40 cursor-pointer hover:bg-surface-muted dark:hover:bg-ink-800 transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent-muted"
                                    >
                                        <input
                                            type="radio"
                                            name="accent-color"
                                            value={id}
                                            checked={accentColor === id}
                                            onChange={() =>
                                                onAccentColorChange(id)
                                            }
                                            className="sr-only"
                                        />
                                        <span
                                            aria-hidden="true"
                                            className="w-8 h-8 rounded-full border-2 border-white/80 dark:border-ink-800 shadow-sm"
                                            style={{ backgroundColor: swatch }}
                                        />
                                        <span className="text-xs font-medium text-ink dark:text-stone-200">
                                            {label}
                                        </span>
                                    </label>
                                ),
                            )}
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend className="text-sm font-semibold text-ink dark:text-stone-200 mb-3">
                            Theme
                        </legend>
                        <div
                            role="radiogroup"
                            aria-label="Theme"
                            className="flex flex-col gap-2"
                        >
                            {THEME_OPTIONS.map(({ value, label }) => (
                                <label
                                    key={value}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-ink-border/40 dark:border-ink-border-dark/40 cursor-pointer hover:bg-surface-muted dark:hover:bg-ink-800 transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent-muted"
                                >
                                    <input
                                        type="radio"
                                        name="theme"
                                        value={value}
                                        checked={themePreference === value}
                                        onChange={() =>
                                            onThemePreferenceChange(value)
                                        }
                                        className="w-4 h-4 text-accent focus:ring-accent/50"
                                    />
                                    <span className="text-sm font-medium text-ink dark:text-stone-200">
                                        {label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default SettingsModal;
