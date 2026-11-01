import { ArrowRight } from "lucide-react";
import type { AuthMode } from "./types";
import { Reveal } from "./Reveal";

export default function FinalCTA({ onAuth }: { onAuth: (m: AuthMode) => void }) {
    return (
        <section
            data-testid="final-cta-section"
            className="relative overflow-hidden border-t border-orbit-border py-24 lg:py-36"
        >
            <div aria-hidden className="absolute inset-0 -z-10">
                <div className="orbit-dots orbit-mask-radial absolute inset-0" />
                <div className="absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orbit-brand/[0.07] blur-[130px]" />
            </div>

            <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6">
                <h2
                    data-testid="final-cta-headline"
                    className="orbit-font-display text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl lg:text-6xl"
                >
                    Make social media management{" "}
                    <em className="orbit-font-serif font-normal italic text-orbit-brand">effortless</em>.
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-orbit-muted-foreground">
                    Spend less time managing posts and more time growing your
                    audience.
                </p>
                <div className="mt-9 flex flex-col items-center gap-3">
                    <button
                        data-testid="final-cta-button"
                        onClick={() => onAuth("signup")}
                        className="group inline-flex h-12 items-center gap-2 rounded-[12px] bg-orbit-brand px-7 text-base font-medium text-white transition-all duration-300 hover:opacity-90"
                    >
                        Get Started Free
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </button>
                    <span className="orbit-font-mono text-[11px] uppercase tracking-[0.18em] text-orbit-muted-foreground">
                        Free to start · Set up in minutes
                    </span>
                </div>
            </Reveal>
        </section>
    );
}
