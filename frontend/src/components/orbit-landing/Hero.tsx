import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import type { AuthMode } from "./types";
import { scrollToId } from "./scroll";
import DashboardPreview from "./DashboardPreview";
import { PlatformIcon, PLATFORMS } from "./Platforms";
import { EASE } from "./Reveal";

function Line({ children, delay }: { children: ReactNode; delay: number }) {
    return (
        <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
            <motion.span
                className="block"
                initial={{ y: "112%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay, ease: EASE }}
            >
                {children}
            </motion.span>
        </span>
    );
}

export default function Hero({ onAuth }: { onAuth: (m: AuthMode) => void }) {
    return (
        <section data-testid="hero-section" className="relative overflow-hidden">
            {/* backdrop */}
            <div aria-hidden className="absolute inset-0 -z-10">
                <div className="orbit-dots orbit-mask-radial absolute inset-0" />
                <div className="absolute -top-48 right-[-10%] size-[620px] rounded-full bg-orbit-brand/[0.08] blur-[140px]" />
            </div>

            <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pb-28 lg:pt-44">
                {/* copy */}
                <div className="lg:col-span-6">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
                    >
                        <button
                            data-testid="hero-badge"
                            onClick={() => scrollToId("features")}
                            className="group inline-flex items-center gap-2 rounded-full border border-orbit-border bg-orbit-card py-1.5 pl-3 pr-2.5 text-sm text-orbit-muted-foreground transition-colors hover:border-orbit-brand/40 hover:text-orbit-foreground"
                        >
                            <Sparkles className="size-3.5 text-orbit-brand" />
                            Orbit AI is here
                            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </button>
                    </motion.div>

                    <h1
                        data-testid="hero-headline"
                        className="mt-6 orbit-font-display text-4xl font-semibold leading-[1.06] tracking-[-0.03em] sm:text-5xl lg:text-6xl"
                    >
                        <Line delay={0.2}>Your social media,</Line>
                        <Line delay={0.32}>
                            <em className="orbit-font-serif font-normal italic tracking-normal text-orbit-brand">
                                smarter
                            </em>{" "}
                            with AI.
                        </Line>
                    </h1>

                    <motion.p
                        data-testid="hero-subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
                        className="mt-6 max-w-lg text-lg leading-relaxed text-orbit-muted-foreground"
                    >
                        Create, schedule, and publish content across all your social
                        accounts from one simple workspace.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
                        className="mt-8 flex flex-wrap items-center gap-3"
                    >
                        <button
                            data-testid="hero-cta-get-started"
                            onClick={() => onAuth("signup")}
                            className="group inline-flex h-11 items-center gap-2 rounded-[12px] bg-orbit-brand px-5 text-sm font-medium text-white transition-all duration-300 hover:opacity-90"
                        >
                            Get Started Free
                            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </button>
                        <button
                            data-testid="hero-cta-explore"
                            onClick={() => scrollToId("features")}
                            className="inline-flex h-11 items-center rounded-[12px] border border-orbit-border bg-orbit-card px-5 text-sm font-medium transition-colors duration-300 hover:border-orbit-brand/50"
                        >
                            Explore Features
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                        className="mt-10 flex items-center gap-3"
                    >
                        <span className="flex -space-x-1.5">
                            {PLATFORMS.slice(0, 5).map((p) => (
                                <span
                                    key={p.key}
                                    className="grid size-7 place-items-center rounded-full border border-orbit-border bg-orbit-card"
                                    style={{
                                        color: p.mono ? "hsl(var(--orb-foreground))" : p.color,
                                    }}
                                >
                                    <PlatformIcon platform={p.key} className="size-3" />
                                </span>
                            ))}
                        </span>
                        <span className="text-sm text-orbit-muted-foreground">
                            Works with all major platforms
                        </span>
                    </motion.div>
                </div>

                {/* visual */}
                <div className="lg:col-span-6">
                    <DashboardPreview />
                </div>
            </div>
        </section>
    );
}
