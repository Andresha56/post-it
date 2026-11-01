import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
    Check,
    RefreshCw,
    Search,
    Sparkles,
    Wand2,
} from "lucide-react";
import { PlatformIcon, type PlatformKey } from "./Platforms";
import { Reveal, SectionTag } from "./Reveal";

const IMG_COFFEE =
    "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?auto=format&fit=crop&w=640&q=80";

function Card({
    className = "",
    testid,
    children,
}: {
    className?: string;
    testid: string;
    children: ReactNode;
}) {
    return (
        <div
            data-testid={testid}
            className={`group flex h-full flex-col rounded-[12px] border border-orbit-border bg-orbit-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orbit-brand/40 hover:shadow-[0_28px_56px_-28px_rgba(15,15,30,0.4)] ${className}`}
        >
            {children}
        </div>
    );
}

function CardHead({
    title,
    desc,
    icon,
}: {
    title: string;
    desc: string;
    icon: ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-[12px] bg-orbit-brand/10 text-orbit-brand">
                {icon}
            </span>
            <div>
                <h3 className="orbit-font-display text-lg font-semibold tracking-tight">
                    {title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-orbit-muted-foreground">{desc}</p>
            </div>
        </div>
    );
}

const CAPTION =
    "Behind every great launch is a story worth telling — let Orbit tell yours.";

export default function Features() {
    const words = CAPTION.split(" ");
    return (
        <section id="features" data-testid="bento-section" className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Reveal className="max-w-2xl">
                    <SectionTag>Features</SectionTag>
                    <h2 className="mt-4 orbit-font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                        Everything you need to{" "}
                        <em className="orbit-font-serif font-normal italic text-orbit-brand">
                            run
                        </em>{" "}
                        your social presence
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-orbit-muted-foreground">
                        Six deeply integrated tools that replace a drawer of
                        single-purpose apps.
                    </p>
                </Reveal>

                <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12 lg:gap-7">
                    {/* 1 — AI Content Creation */}
                    <Reveal className="md:col-span-2 lg:col-span-7" delay={0}>
                        <Card testid="feature-card-ai-content">
                            <CardHead
                                icon={<Sparkles className="size-4" />}
                                title="AI Content Creation"
                                desc="Generate captions, post ideas, and engaging content with AI assistance."
                            />
                            <div className="mt-6 flex-1 rounded-[12px] border border-orbit-border bg-orbit-background p-4">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {["Product launch", "Behind the scenes", "Tips thread"].map(
                                        (c, i) => (
                                            <span
                                                key={c}
                                                className={`rounded-full px-2.5 py-1 text-[11px] ${
                                                    i === 0
                                                        ? "bg-orbit-brand/15 font-medium text-orbit-brand"
                                                        : "bg-orbit-foreground/5 text-orbit-muted-foreground"
                                                }`}
                                            >
                                                {c}
                                            </span>
                                        ),
                                    )}
                                    <span className="ml-auto rounded-full border border-orbit-border px-2.5 py-1 text-[11px] text-orbit-muted-foreground">
                                        Professional
                                    </span>
                                </div>
                                <p className="mt-4 min-h-[3.4rem] text-sm leading-relaxed">
                                    {words.map((w, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0.12 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                delay: 0.35 + i * 0.055,
                                                duration: 0.3,
                                            }}
                                        >
                                            {w}{" "}
                                        </motion.span>
                                    ))}
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 text-[11px] text-orbit-muted-foreground">
                                        <RefreshCw className="size-3" /> Regenerate
                                    </span>
                                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-[10px] bg-orbit-brand px-2.5 py-1 text-[11px] font-medium text-white">
                                        <Check className="size-3" /> Insert into post
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </Reveal>

                    {/* 2 — Multi-Platform Publishing */}
                    <Reveal className="lg:col-span-5" delay={0.08}>
                        <Card testid="feature-card-multi-platform">
                            <CardHead
                                icon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-4" aria-hidden>
                                        <path d="M22 2 11 13" />
                                        <path d="M22 2 15 22l-4-9-9-4z" />
                                    </svg>
                                }
                                title="Multi-Platform Publishing"
                                desc="Manage and publish content across multiple connected social accounts."
                            />
                            <div className="mt-6 flex-1 space-y-2.5">
                                {(
                                    [
                                        { k: "instagram", f: "Feed post", on: true },
                                        { k: "x", f: "Thread · 4 posts", on: true },
                                        { k: "linkedin", f: "Article", on: false },
                                    ] as { k: PlatformKey; f: string; on: boolean }[]
                                ).map((p) => {
                                    const mono = p.k === "x" || p.k === "tiktok";
                                    const color =
                                        p.k === "instagram" ? "#E1306C" : p.k === "facebook" ? "#1877F2" : p.k === "linkedin" ? "#0A66C2" : p.k === "youtube" ? "#FF0000" : "";
                                    return (
                                        <div
                                            key={p.k}
                                            className="flex items-center gap-3 rounded-[12px] border border-orbit-border bg-orbit-background px-3 py-2.5"
                                        >
                                            <span
                                                className="grid size-7 place-items-center rounded-[10px]"
                                                style={{
                                                    backgroundColor: mono
                                                        ? "hsl(var(--orb-foreground) / 0.08)"
                                                        : `${color}1f`,
                                                    color: mono
                                                        ? "hsl(var(--orb-foreground))"
                                                        : color,
                                                }}
                                            >
                                                <PlatformIcon platform={p.k} className="size-3.5" />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium capitalize">{p.k === "x" ? "X" : p.k}</p>
                                                <p className="text-[11px] text-orbit-muted-foreground">{p.f}</p>
                                            </div>
                                            <span
                                                className={`relative ml-auto h-4 w-8 shrink-0 rounded-full transition-colors ${
                                                    p.on ? "bg-orbit-brand" : "bg-orbit-foreground/15"
                                                }`}
                                            >
                                                <span
                                                    className={`absolute top-0.5 size-3 rounded-full bg-white transition-all ${
                                                        p.on ? "left-[18px]" : "left-0.5"
                                                    }`}
                                                />
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </Reveal>

                    {/* 3 — Smart Scheduling */}
                    <Reveal className="lg:col-span-4" delay={0}>
                        <Card testid="feature-card-smart-scheduling">
                            <CardHead
                                icon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-4" aria-hidden>
                                        <rect x="3" y="4" width="18" height="18" rx="2" />
                                        <path d="M16 2v4M8 2v4M3 10h18" />
                                    </svg>
                                }
                                title="Smart Scheduling"
                                desc="Plan posts ahead of time with an intuitive content calendar."
                            />
                            <div className="mt-6 flex-1">
                                <div className="relative grid grid-cols-7 gap-1.5">
                                    {[
                                        1, 2, 3, 2, 1, 0.4, 0.8, 2, 3, 1, 2, 0.6, 0.3, 1, 1, 2.6,
                                        3, 2, 1, 0.5, 0.9, 0.6, 1.2, 2.2, 1.4, 0.8, 0.3, 0.5,
                                    ].map((v, i) => (
                                        <span
                                            key={i}
                                            className={`h-7 rounded-[5px] ${
                                                i === 9 ? "ring-2 ring-orbit-brand" : ""
                                            }`}
                                            style={{
                                                backgroundColor: `hsl(var(--orb-brand) / ${0.08 + v * 0.3})`,
                                            }}
                                        />
                                    ))}
                                    <span className="absolute -top-9 left-[38%] whitespace-nowrap rounded-[10px] border border-orbit-border bg-orbit-card px-2 py-1 orbit-font-mono text-[10px] text-orbit-foreground shadow-md">
                                        Tue 10:30 · best time
                                        <span className="absolute -bottom-1 left-3 size-2 rotate-45 border-b border-r border-orbit-border bg-orbit-card" />
                                    </span>
                                </div>
                                <div className="mt-3 flex justify-between orbit-font-mono text-[9px] uppercase tracking-wider text-orbit-muted-foreground">
                                    <span>Mon</span>
                                    <span>Wed</span>
                                    <span>Fri</span>
                                    <span>Sun</span>
                                </div>
                            </div>
                        </Card>
                    </Reveal>

                    {/* 4 — Content Management */}
                    <Reveal className="lg:col-span-4" delay={0.08}>
                        <Card testid="feature-card-content-management">
                            <CardHead
                                icon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                    </svg>
                                }
                                title="Content Management"
                                desc="Manage drafts, scheduled posts, and published content in one place."
                            />
                            <div className="mt-6 flex-1 space-y-2">
                                <div className="flex items-center gap-2 rounded-[12px] border border-orbit-border bg-orbit-background px-3 py-2 text-orbit-muted-foreground">
                                    <Search className="size-3.5" />
                                    <span className="text-[12px]">Search assets…</span>
                                    <span className="ml-auto orbit-font-mono text-[9px] uppercase tracking-wider">24 files</span>
                                </div>
                                {[
                                    { name: "launch-teaser.mp4", tag: "Launch", dot: "bg-orbit-brand" },
                                    { name: "studio-set.jpg", tag: "Q3", dot: "bg-orbit-success" },
                                    { name: "team-bts.png", tag: "BTS", dot: "bg-orbit-warning" },
                                ].map((a) => (
                                    <div
                                        key={a.name}
                                        className="flex items-center gap-3 rounded-[12px] border border-orbit-border bg-orbit-background px-3 py-2"
                                    >
                                        <span className={`size-2 rounded-full ${a.dot}`} />
                                        <span className="orbit-font-mono text-[11px]">{a.name}</span>
                                        <span className="ml-auto rounded-full bg-orbit-foreground/5 px-2 py-0.5 text-[10px] text-orbit-muted-foreground">
                                            {a.tag}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Reveal>

                    {/* 5 — AI Image Assistance */}
                    <Reveal className="lg:col-span-4" delay={0.16}>
                        <Card testid="feature-card-ai-image">
                            <CardHead
                                icon={<Wand2 className="size-4" />}
                                title="AI Image Assistance"
                                desc="Create and enhance visual content for social media posts."
                            />
                            <div className="relative mt-6 flex-1 overflow-hidden rounded-[12px]">
                                <img
                                    src={IMG_COFFEE}
                                    alt="AI enhanced social post visual"
                                    loading="lazy"
                                    className="h-44 w-full rounded-[12px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                />
                                <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-[10px] bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                                    <Wand2 className="size-3" /> AI enhanced
                                </span>
                                <div className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-1.5 rounded-[12px] bg-black/55 p-1.5 backdrop-blur-sm">
                                    {["1:1", "4:5", "16:9"].map((a, i) => (
                                        <span
                                            key={a}
                                            className={`rounded px-1.5 py-0.5 orbit-font-mono text-[10px] ${
                                                i === 1
                                                    ? "bg-white text-black"
                                                    : "text-white/80"
                                            }`}
                                        >
                                            {a}
                                        </span>
                                    ))}
                                    <span className="ml-auto inline-flex items-center gap-1 rounded bg-orbit-brand px-2 py-0.5 text-[10px] font-medium text-white">
                                        <Sparkles className="size-2.5" /> Enhance
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </Reveal>

                    {/* 6 — Centralized Dashboard */}
                    <Reveal className="md:col-span-2 lg:col-span-12" delay={0}>
                        <Card testid="feature-card-centralized-dashboard">
                            <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.4fr]">
                                <div>
                                    <CardHead
                                        icon={
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
                                                <rect x="3" y="3" width="7" height="9" rx="1" />
                                                <rect x="14" y="3" width="7" height="5" rx="1" />
                                                <rect x="14" y="12" width="7" height="9" rx="1" />
                                                <rect x="3" y="16" width="7" height="5" rx="1" />
                                            </svg>
                                        }
                                        title="Centralized Dashboard"
                                        desc="Manage all your social accounts from a single workspace."
                                    />
                                    <div className="mt-5 flex -space-x-2">
                                        {(["instagram", "x", "linkedin", "tiktok"] as PlatformKey[]).map(
                                            (k) => (
                                                <span
                                                    key={k}
                                                    className="grid size-9 place-items-center rounded-full border-2 border-orbit-card bg-orbit-background"
                                                    style={{
                                                        color:
                                                            k === "instagram" ? "#E1306C" : k === "linkedin" ? "#0A66C2" : "hsl(var(--orb-foreground))",
                                                    }}
                                                >
                                                    <PlatformIcon platform={k} className="size-4" />
                                                </span>
                                            ),
                                        )}
                                        <span className="grid size-9 place-items-center rounded-full border-2 border-orbit-card bg-orbit-brand/15 orbit-font-mono text-[11px] font-medium text-orbit-brand">
                                            +9
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {[
                                        { l: "Impressions", v: "2.4M" },
                                        { l: "Engagement", v: "4.8%" },
                                        { l: "Scheduled", v: "24" },
                                        { l: "New followers", v: "+12.1K" },
                                    ].map((s) => (
                                        <div
                                            key={s.l}
                                            className="rounded-[12px] border border-orbit-border bg-orbit-background p-3"
                                        >
                                            <p className="orbit-font-mono text-[9px] uppercase tracking-wider text-orbit-muted-foreground">
                                                {s.l}
                                            </p>
                                            <p className="mt-1 orbit-font-display text-xl font-semibold">
                                                {s.v}
                                            </p>
                                        </div>
                                    ))}
                                    <div className="col-span-2 h-14 sm:col-span-4">
                                        <svg viewBox="0 0 400 56" preserveAspectRatio="none" className="h-full w-full">
                                            <path
                                                d="M0 44 C 30 40, 45 30, 70 32 S 120 20, 150 24 S 210 10, 240 14 S 300 6, 330 10 S 380 2, 400 4"
                                                fill="none"
                                                stroke="hsl(var(--orb-brand))"
                                                strokeWidth="2"
                                            />
                                            <path
                                                d="M0 44 C 30 40, 45 30, 70 32 S 120 20, 150 24 S 210 10, 240 14 S 300 6, 330 10 S 380 2, 400 4 L 400 56 L 0 56 Z"
                                                fill="hsl(var(--orb-brand) / 0.12)"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
