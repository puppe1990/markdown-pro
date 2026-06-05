/** Shared Tailwind class groups — single source for visual consistency. */

export const appShell =
    'flex flex-col h-screen font-sans antialiased bg-paper dark:bg-ink-950';

export const borderSubtle =
    'border-ink-border/60 dark:border-ink-border-dark/60';

/** Primary text on light/dark surfaces (inputs, menus, body). */
export const textOnSurface = 'text-ink dark:text-stone-100';

/** Secondary labels and hints. */
export const textOnSurfaceMuted = 'text-ink-muted dark:text-stone-400';

export const placeholderOnSurface =
    'placeholder:text-ink-faint dark:placeholder:text-stone-500';

export const surfaceBar = 'bg-surface/85 dark:bg-ink-900/85 backdrop-blur-md';

export const btnPrimary =
    'inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ink-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100';

export const btnPrimaryCompact =
    'inline-flex items-center justify-center rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-accent-hover active:scale-[0.98]';

export const btnSecondary =
    'px-4 py-2 text-sm font-medium text-ink-muted bg-surface-muted dark:bg-ink-800 rounded-lg hover:bg-ink-border/40 dark:hover:bg-ink-800/80 transition-colors';

export const btnDanger =
    'px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors active:scale-[0.98]';

export const btnIcon =
    'p-2 rounded-lg text-ink-muted dark:text-stone-400 hover:text-ink dark:hover:text-stone-100 hover:bg-surface-muted dark:hover:bg-ink-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50';

export const btnIconActive = 'p-2 rounded-lg bg-accent-muted text-accent';

/** Label shown below icon buttons on hover/focus (header sits at viewport top). */
export const iconTooltipLabel =
    'pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-md bg-ink-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-stone-700 z-50 whitespace-nowrap';

export const tabActive = 'bg-accent-muted text-accent border-b-2 border-accent';

export const tabInactive =
    'text-ink-muted hover:bg-surface-muted dark:hover:bg-ink-800';

export const inputBase = `w-full px-4 py-2.5 rounded-lg border bg-surface dark:bg-ink-800 ${textOnSurface} ${placeholderOnSurface} focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none transition`;

export function inputClass(hasError: boolean): string {
    return `${inputBase} ${hasError ? 'border-red-500 dark:border-red-400' : 'border-ink-border dark:border-ink-border-dark'}`;
}

export const authPage =
    'min-h-screen flex items-center justify-center bg-paper dark:bg-ink-950 relative overflow-hidden';

export const authCard =
    'relative w-full max-w-md p-8 sm:p-10 bg-surface/95 dark:bg-ink-900/95 rounded-2xl shadow-2xl border border-ink-border/50 backdrop-blur-sm';

export const dropdownMenu =
    'absolute right-0 mt-2 bg-surface dark:bg-ink-800 rounded-xl shadow-xl py-1.5 z-50 border border-ink-border/50 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200';

export const dropdownItem = `w-full text-left px-4 py-2.5 text-sm ${textOnSurface} hover:bg-accent-muted flex items-center gap-3 transition-colors`;

export const panelSlide =
    'absolute right-0 top-0 h-full w-full max-w-md bg-surface/95 dark:bg-ink-900/95 backdrop-blur-xl shadow-2xl flex flex-col border-l border-ink-border/50 animate-in slide-in-from-right duration-300';

export const editorPane = 'flex flex-col h-full bg-surface dark:bg-ink-950';

export const previewPane = 'h-full overflow-y-auto bg-paper dark:bg-ink-950';

export const prosePreview =
    'prose prose-stone dark:prose-invert max-w-none p-6 md:p-10 font-serif prose-headings:font-sans prose-headings:tracking-tight prose-headings:text-ink dark:prose-headings:text-stone-100 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-ink/90 dark:prose-p:text-stone-300 prose-p:leading-relaxed prose-a:text-accent prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-code:font-mono prose-code:text-accent prose-code:bg-accent-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-ink-900 dark:prose-pre:bg-ink-950 prose-pre:rounded-xl prose-blockquote:border-l-[3px] prose-blockquote:border-accent prose-blockquote:bg-accent-muted prose-blockquote:pl-5 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-strong:text-ink dark:prose-strong:text-stone-100';
