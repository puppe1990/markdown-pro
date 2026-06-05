import type { ColorScheme } from './theme';

export type AccentColorId =
    | 'teal'
    | 'blue'
    | 'violet'
    | 'rose'
    | 'amber'
    | 'emerald';

export type AccentTokens = {
    accent: string;
    hover: string;
    light: string;
    muted: string;
};

type AccentPaletteEntry = {
    label: string;
    swatch: string;
    light: AccentTokens;
    dark: AccentTokens;
};

const ACCENT_PALETTE: Record<AccentColorId, AccentPaletteEntry> = {
    teal: {
        label: 'Teal',
        swatch: '#0d9488',
        light: {
            accent: '#0d9488',
            hover: '#0f766e',
            light: '#14b8a6',
            muted: 'rgba(13, 148, 136, 0.12)',
        },
        dark: {
            accent: '#2dd4bf',
            hover: '#14b8a6',
            light: '#5eead4',
            muted: 'rgba(45, 212, 191, 0.12)',
        },
    },
    blue: {
        label: 'Blue',
        swatch: '#2563eb',
        light: {
            accent: '#2563eb',
            hover: '#1d4ed8',
            light: '#3b82f6',
            muted: 'rgba(37, 99, 235, 0.12)',
        },
        dark: {
            accent: '#60a5fa',
            hover: '#3b82f6',
            light: '#93c5fd',
            muted: 'rgba(96, 165, 250, 0.12)',
        },
    },
    violet: {
        label: 'Violet',
        swatch: '#7c3aed',
        light: {
            accent: '#7c3aed',
            hover: '#6d28d9',
            light: '#8b5cf6',
            muted: 'rgba(124, 58, 237, 0.12)',
        },
        dark: {
            accent: '#a78bfa',
            hover: '#8b5cf6',
            light: '#c4b5fd',
            muted: 'rgba(167, 139, 250, 0.12)',
        },
    },
    rose: {
        label: 'Rose',
        swatch: '#e11d48',
        light: {
            accent: '#e11d48',
            hover: '#be123c',
            light: '#f43f5e',
            muted: 'rgba(225, 29, 72, 0.12)',
        },
        dark: {
            accent: '#fb7185',
            hover: '#f43f5e',
            light: '#fda4af',
            muted: 'rgba(251, 113, 133, 0.12)',
        },
    },
    amber: {
        label: 'Amber',
        swatch: '#d97706',
        light: {
            accent: '#d97706',
            hover: '#b45309',
            light: '#f59e0b',
            muted: 'rgba(217, 119, 6, 0.12)',
        },
        dark: {
            accent: '#fbbf24',
            hover: '#f59e0b',
            light: '#fcd34d',
            muted: 'rgba(251, 191, 36, 0.12)',
        },
    },
    emerald: {
        label: 'Emerald',
        swatch: '#059669',
        light: {
            accent: '#059669',
            hover: '#047857',
            light: '#10b981',
            muted: 'rgba(5, 150, 105, 0.12)',
        },
        dark: {
            accent: '#34d399',
            hover: '#10b981',
            light: '#6ee7b7',
            muted: 'rgba(52, 211, 153, 0.12)',
        },
    },
};

export const ACCENT_COLOR_IDS = Object.keys(ACCENT_PALETTE) as AccentColorId[];

export const ACCENT_COLOR_OPTIONS = ACCENT_COLOR_IDS.map((id) => ({
    id,
    label: ACCENT_PALETTE[id].label,
    swatch: ACCENT_PALETTE[id].swatch,
}));

const DEFAULT_ACCENT: AccentColorId = 'teal';

/**
 * Parses stored accent preference; unknown values fall back to teal.
 * Example: parseAccentColor('blue') // 'blue'
 */
export function parseAccentColor(value: string): AccentColorId {
    if (value in ACCENT_PALETTE) {
        return value as AccentColorId;
    }
    return DEFAULT_ACCENT;
}

/**
 * Resolves accent tokens for the active color scheme.
 * Example: getAccentTokens('blue', 'dark').accent // '#60a5fa'
 */
export function getAccentTokens(
    accentColor: AccentColorId,
    colorScheme: ColorScheme,
): AccentTokens {
    const entry = ACCENT_PALETTE[accentColor] ?? ACCENT_PALETTE[DEFAULT_ACCENT];
    return colorScheme === 'dark' ? entry.dark : entry.light;
}

/**
 * Applies accent CSS variables on `<html>` for Tailwind `accent-*` utilities.
 * Example: applyDocumentAccent('violet', 'light')
 */
export function applyDocumentAccent(
    accentColor: AccentColorId,
    colorScheme: ColorScheme,
): void {
    if (typeof document === 'undefined') {
        return;
    }
    const tokens = getAccentTokens(accentColor, colorScheme);
    const root = document.documentElement;
    root.style.setProperty('--color-accent', tokens.accent);
    root.style.setProperty('--color-accent-hover', tokens.hover);
    root.style.setProperty('--color-accent-light', tokens.light);
    root.style.setProperty('--color-accent-muted', tokens.muted);
}
