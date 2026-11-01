import type { MouseEvent } from "react";
import { scrollToId } from "./scroll";
import Logo, { OrbitMark } from "./Logo";
import { PLATFORMS, PlatformIcon } from "./Platforms";

const PRODUCT_LINKS = [
    { label: "Content Studio", id: "showcase" },
    { label: "Calendar", id: "showcase" },
    { label: "Features", id: "features" },
    { label: "How it works", id: "how-it-works" },
];

const FEATURE_LINKS = [
    { label: "AI Content Creation", id: "features" },
    { label: "Multi-Platform Publishing", id: "features" },
    { label: "Smart Scheduling", id: "features" },
    { label: "AI Image Assistance", id: "features" },
];

export default function Footer() {
    const go = (id: string) => (e: MouseEvent) => {
        e.preventDefault();
        scrollToId(id);
    };

    return (
        <footer data-testid="footer-section" className="border-t border-orbit-border bg-orbit-surface/60">
            <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-10 pb-16 md:grid-cols-12">
                    <div className="col-span-2 md:col-span-5">
                        <a href="#" onClick={(e) => e.preventDefault()} data-testid="footer-logo" className="inline-block">
                            <Logo />
                        </a>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-orbit-muted-foreground">
                            Create, schedule, and publish content across all your
                            social accounts from one simple workspace.
                        </p>
                        <div className="mt-6 flex gap-2">
                            {PLATFORMS.map((p) => (
                                <a
                                    key={p.key}
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    aria-label={p.name}
                                    className="grid size-8 place-items-center rounded-[12px] border border-orbit-border bg-orbit-card text-orbit-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-orbit-brand/40 hover:text-orbit-foreground"
                                >
                                    <PlatformIcon platform={p.key} className="size-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <p className="orbit-font-mono text-[11px] uppercase tracking-[0.18em] text-orbit-muted-foreground">
                            Product
                        </p>
                        <ul className="mt-4 space-y-2.5">
                            {PRODUCT_LINKS.map((l) => (
                                <li key={l.label}>
                                    <a
                                        href={`#${l.id}`}
                                        onClick={go(l.id)}
                                        className="text-sm text-orbit-foreground/80 transition-colors hover:text-orbit-brand"
                                    >
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <p className="orbit-font-mono text-[11px] uppercase tracking-[0.18em] text-orbit-muted-foreground">
                            Features
                        </p>
                        <ul className="mt-4 space-y-2.5">
                            {FEATURE_LINKS.map((l) => (
                                <li key={l.label}>
                                    <a
                                        href={`#${l.id}`}
                                        onClick={go(l.id)}
                                        className="text-sm text-orbit-foreground/80 transition-colors hover:text-orbit-brand"
                                    >
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <p className="orbit-font-mono text-[11px] uppercase tracking-[0.18em] text-orbit-muted-foreground">
                            Legal & Contact
                        </p>
                        <ul className="mt-4 space-y-2.5">
                            <li>
                                <a
                                    href="mailto:hello@orbit.app"
                                    data-testid="footer-link-product"
                                    className="text-sm text-orbit-foreground/80 transition-colors hover:text-orbit-brand"
                                >
                                    hello@orbit.app
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    data-testid="footer-link-privacy"
                                    className="text-sm text-orbit-foreground/80 transition-colors hover:text-orbit-brand"
                                >
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    data-testid="footer-link-terms"
                                    className="text-sm text-orbit-foreground/80 transition-colors hover:text-orbit-brand"
                                >
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-3 border-t border-orbit-border py-6 text-sm text-orbit-muted-foreground sm:flex-row">
                    <span>© 2025 Orbit, Inc. All rights reserved.</span>
                    <span className="inline-flex items-center gap-2">
                        <OrbitMark className="size-4 text-orbit-foreground" />
                        Made for creators and teams
                    </span>
                </div>
            </div>

            <div aria-hidden className="select-none overflow-hidden">
                <p className="-mb-[0.28em] text-center orbit-font-display text-[21vw] font-semibold leading-[0.78] tracking-tight text-orbit-foreground/[0.045]">
                    Orbit
                </p>
            </div>
        </footer>
    );
}
