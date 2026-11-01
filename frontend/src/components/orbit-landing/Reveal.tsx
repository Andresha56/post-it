import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Reveal({
    children,
    delay = 0,
    y = 28,
    className,
}: {
    children: ReactNode;
    delay?: number;
    y?: number;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.9, delay, ease: EASE }}
        >
            {children}
        </motion.div>
    );
}

export function SectionTag({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 orbit-font-mono text-xs uppercase tracking-[0.2em] text-orbit-brand">
            <span className="h-px w-6 bg-orbit-brand/60" />
            {children}
        </span>
    );
}
