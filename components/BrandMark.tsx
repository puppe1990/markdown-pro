interface BrandMarkProps {
    size?: 'sm' | 'md' | 'lg';
    centered?: boolean;
}

const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
} as const;

/** App wordmark — Instrument Sans with accent on "Pro". */
export function BrandMark({ size = 'md', centered = false }: BrandMarkProps) {
    return (
        <h1
            className={`font-bold tracking-tight text-ink dark:text-stone-100 ${sizeClasses[size]} ${centered ? 'text-center' : ''}`}
        >
            Markdown <span className="text-accent">Pro</span>
        </h1>
    );
}
