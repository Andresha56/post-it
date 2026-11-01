export function OrbitMark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
            <circle cx="16" cy="16" r="6.2" fill="currentColor" />
            <ellipse
                cx="16"
                cy="16"
                rx="12.4"
                ry="4.6"
                stroke="currentColor"
                strokeWidth="1.7"
                transform="rotate(-24 16 16)"
                opacity="0.85"
            />
            <circle cx="25.6" cy="8.9" r="1.9" fill="hsl(var(--orb-brand))" />
        </svg>
    );
}

export default function Logo({ compact = false }: { compact?: boolean }) {
    return (
        <span className="inline-flex items-center gap-2.5">
            <OrbitMark className="size-7 text-orbit-foreground" />
            {!compact && (
                <span className="orbit-font-display text-xl font-semibold tracking-tight">
                    Orbit
                </span>
            )}
        </span>
    );
}
