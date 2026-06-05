/** Global CSS injected in the root document — fonts, tokens, atmosphere. */

export const FONT_STYLESHEET =
    'https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap';

export const TAILWIND_CONFIG_SCRIPT = `
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
                serif: ['"Source Serif 4"', 'Georgia', 'serif'],
            },
            colors: {
                paper: '#f8f6f3',
                ink: {
                    DEFAULT: '#1c1917',
                    muted: '#78716c',
                    faint: '#a8a29e',
                    border: '#e7e5e4',
                    'border-dark': '#2a3330',
                    950: '#0c0f0e',
                    900: '#141918',
                    800: '#1f2422',
                },
                surface: {
                    DEFAULT: '#ffffff',
                    muted: '#f3f1ed',
                },
                accent: {
                    DEFAULT: 'var(--color-accent)',
                    hover: 'var(--color-accent-hover)',
                    light: 'var(--color-accent-light)',
                    muted: 'var(--color-accent-muted)',
                },
            },
            animation: {
                in: 'in 0.2s ease-out',
                'fade-in': 'fade-in 0.2s ease-out',
                'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
                'slide-in-from-top-2': 'slide-in-from-top-2 0.2s ease-out',
            },
            keyframes: {
                in: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                'slide-in-from-right': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'slide-in-from-top-2': {
                    '0%': { transform: 'translateY(-8px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
};
`;

export const GLOBAL_CSS = `
    :root {
        --color-accent: #0d9488;
        --color-accent-hover: #0f766e;
        --color-accent-light: #14b8a6;
        --color-accent-muted: rgba(13, 148, 136, 0.12);
        --color-paper: #f8f6f3;
        --color-surface: #ffffff;
    }
    .dark {
        --color-accent: #2dd4bf;
        --color-accent-hover: #14b8a6;
        --color-accent-light: #5eead4;
        --color-accent-muted: rgba(45, 212, 191, 0.12);
        --color-paper: #0c0f0e;
        --color-surface: #141918;
    }
    body {
        font-family: 'Instrument Sans', system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    * { scroll-behavior: smooth; }
    ::-webkit-scrollbar { width: 7px; height: 7px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
        background: rgba(120, 113, 108, 0.35);
        border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: rgba(120, 113, 108, 0.55);
    }
    .dark ::-webkit-scrollbar-thumb {
        background: rgba(168, 162, 158, 0.25);
    }
    .dark ::-webkit-scrollbar-thumb:hover {
        background: rgba(168, 162, 158, 0.4);
    }
    .auth-glow::before {
        content: '';
        position: absolute;
        inset: -40%;
        background:
            radial-gradient(ellipse 50% 40% at 20% 30%, rgba(13, 148, 136, 0.15), transparent 70%),
            radial-gradient(ellipse 40% 35% at 80% 70%, rgba(45, 212, 191, 0.08), transparent 65%);
        pointer-events: none;
    }
    .dark .auth-glow::before {
        background:
            radial-gradient(ellipse 50% 40% at 20% 30%, rgba(45, 212, 191, 0.12), transparent 70%),
            radial-gradient(ellipse 40% 35% at 80% 70%, rgba(13, 148, 136, 0.06), transparent 65%);
    }
    .workspace-grid {
        background-image:
            linear-gradient(rgba(120, 113, 108, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 113, 108, 0.04) 1px, transparent 1px);
        background-size: 24px 24px;
    }
    .dark .workspace-grid {
        background-image:
            linear-gradient(rgba(168, 162, 158, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 162, 158, 0.06) 1px, transparent 1px);
    }
`;
