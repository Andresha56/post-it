import { useRef } from "react";
import {
    motion,
    useMotionValue,
    useScroll,
    useSpring,
    useTransform,
} from "framer-motion";
import {
    BarChart3,
    Bell,
    CalendarDays,
    LayoutDashboard,
    Plus,
    Settings,
    Sparkles,
    TrendingUp,
    Users,
} from "lucide-react";
import { PlatformIcon, type PlatformKey } from "./Platforms";
import { EASE } from "./Reveal";

const PLATFORM_COLOR: Record<PlatformKey, string> = {
    instagram: "#E1306C",
    facebook: "#1877F2",
    linkedin: "#0A66C2",
    x: "#0F1419",
    tiktok: "#0F1419",
    youtube: "#FF0000",
};

const BARS = [42, 66, 50, 80, 58, 88, 70, 52, 84, 64, 96, 76];

const WEEK = [
    { d: "Mon", n: 19, dots: ["instagram", "youtube"] as PlatformKey[] },
    { d: "Tue", n: 20, dots: ["linkedin"] as PlatformKey[], time: "10:30" },
    { d: "Wed", n: 21, dots: ["x", "tiktok"] as PlatformKey[] },
    { d: "Thu", n: 22, dots: [] as PlatformKey[] },
    { d: "Fri", n: 23, dots: ["instagram"] as PlatformKey[] },
];

function PlatformDot({ k }: { k: PlatformKey }) {
    const mono = k === "x" || k === "tiktok";
    return (
        <span
            className="grid size-4 place-items-center rounded-[4px]"
            style={{
                backgroundColor: mono ? "hsl(var(--orb-foreground) / 0.1)" : `${PLATFORM_COLOR[k]}1f`,
                color: mono ? "hsl(var(--orb-foreground))" : PLATFORM_COLOR[k],
            }}
        >
            <PlatformIcon platform={k} className="size-2.5" />
        </span>
    );
}

export default function DashboardPreview() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });
    const y = useTransform(scrollYProgress, [0, 1], [40, -30]);
    const rx = useMotionValue(0);
    const ry = useMotionValue(0);
    const srx = useSpring(rx, { stiffness: 110, damping: 16 });
    const sry = useSpring(ry, { stiffness: 110, damping: 16 });

    return (
        <motion.div style={{ y }} ref={ref}>
            <motion.div
                data-testid="hero-dashboard-preview"
                onMouseMove={(e) => {
                    const r = ref.current?.getBoundingClientRect();
                    if (!r) return;
                    const px = (e.clientX - r.left) / r.width - 0.5;
                    const py = (e.clientY - r.top) / r.height - 0.5;
                    ry.set(px * 7);
                    rx.set(-py * 6);
                }}
                onMouseLeave={() => {
                    rx.set(0);
                    ry.set(0);
                }}
                style={{ rotateX: srx, rotateY: sry, transformPerspective: 1200 }}
                initial={{ opacity: 0, y: 48, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
                className="overflow-hidden rounded-[16px] border border-orbit-border bg-orbit-card text-left shadow-[0_48px_90px_-30px_rgba(10,10,20,0.5)]"
            >
                {/* window chrome */}
                <div className="relative flex items-center gap-2 border-b border-orbit-border px-4 py-2.5">
                    <span className="flex gap-1.5">
                        <span className="size-2.5 rounded-full bg-orbit-foreground/15" />
                        <span className="size-2.5 rounded-full bg-orbit-foreground/15" />
                        <span className="size-2.5 rounded-full bg-orbit-foreground/15" />
                    </span>
                    <span className="absolute left-1/2 -translate-x-1/2 rounded-[10px] bg-orbit-foreground/5 px-3 py-1 orbit-font-mono text-[11px] text-orbit-muted-foreground">
                        orbit.app/studio
                    </span>
                </div>

                <div className="flex">
                    {/* sidebar */}
                    <div className="hidden w-12 flex-col items-center gap-1.5 border-r border-orbit-border py-3 sm:flex">
                        {[LayoutDashboard, CalendarDays, Sparkles, BarChart3, Users].map(
                            (Icon, i) => (
                                <span
                                    key={i}
                                    className={`grid size-8 place-items-center rounded-[12px] ${
                                        i === 2
                                            ? "bg-orbit-brand/10 text-orbit-brand"
                                            : "text-orbit-muted-foreground"
                                    }`}
                                >
                                    <Icon className="size-4" />
                                </span>
                            ),
                        )}
                        <span className="mt-auto grid size-8 place-items-center rounded-[12px] text-orbit-muted-foreground">
                            <Settings className="size-4" />
                        </span>
                    </div>

                    {/* main */}
                    <div className="flex-1 space-y-3.5 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">Content Studio</span>
                            <div className="flex items-center gap-2">
                                <span className="grid size-7 place-items-center rounded-[12px] text-orbit-muted-foreground">
                                    <Bell className="size-3.5" />
                                </span>
                                <span className="inline-flex h-7 items-center gap-1 rounded-[12px] bg-orbit-brand px-2.5 text-[11px] font-medium text-white">
                                    <Plus className="size-3" /> New post
                                </span>
                            </div>
                        </div>

                        {/* stats */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: "Scheduled", value: "24", up: "+12%" },
                                { label: "Reach", value: "128.4K", up: "+8%" },
                                { label: "Engagement", value: "4.8%", up: "+21%" },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    className="rounded-[12px] border border-orbit-border bg-orbit-background/60 p-2.5"
                                >
                                    <p className="orbit-font-mono text-[9px] uppercase tracking-wider text-orbit-muted-foreground">
                                        {s.label}
                                    </p>
                                    <div className="mt-1 flex items-baseline justify-between gap-1">
                                        <span className="text-sm font-semibold">{s.value}</span>
                                        <span className="inline-flex items-center text-[9px] font-medium text-orbit-success">
                                            <TrendingUp className="size-2.5" /> {s.up}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* AI panel */}
                        <div className="rounded-[12px] border border-orbit-brand/30 bg-orbit-brand/[0.06] p-3">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-orbit-brand">
                                    <Sparkles className="size-3" /> AI Caption
                                </span>
                                <span className="rounded-[10px] bg-orbit-brand px-2 py-0.5 text-[10px] font-medium text-white">
                                    Write with AI
                                </span>
                            </div>
                            <p className="mt-2 text-[12px] leading-relaxed text-orbit-foreground/90">
                                Behind every great launch is a story worth telling — here&apos;s
                                how we made ours land.
                            </p>
                            <div className="mt-2.5 flex gap-1.5">
                                {["Professional", "Witty", "Bold"].map((t, i) => (
                                    <span
                                        key={t}
                                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                                            i === 0
                                                ? "bg-orbit-brand/15 font-medium text-orbit-brand"
                                                : "bg-orbit-foreground/5 text-orbit-muted-foreground"
                                        }`}
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* week strip */}
                        <div className="flex justify-between gap-2">
                            {WEEK.map((d) => (
                                <div
                                    key={d.d}
                                    className={`flex-1 rounded-[12px] border p-2 text-center ${
                                        d.time ? "border-orbit-brand/40 bg-orbit-brand/[0.06]" : "border-orbit-border bg-orbit-background/60"
                                    }`}
                                >
                                    <p className="text-[9px] uppercase tracking-wider text-orbit-muted-foreground">
                                        {d.d}
                                    </p>
                                    <p className="text-xs font-semibold">{d.n}</p>
                                    <div className="mt-1.5 flex justify-center gap-0.5">
                                        {d.dots.map((k) => (
                                            <PlatformDot key={k} k={k} />
                                        ))}
                                    </div>
                                    {d.time && (
                                        <p className="mt-1 orbit-font-mono text-[8px] text-orbit-brand">
                                            {d.time}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* performance */}
                        <div className="rounded-[12px] border border-orbit-border bg-orbit-background/60 p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-medium">Performance</span>
                                <span className="orbit-font-mono text-[9px] uppercase tracking-wider text-orbit-muted-foreground">
                                    Last 7 days
                                </span>
                            </div>
                            <div className="mt-2 flex h-16 items-end gap-1.5">
                                {BARS.map((h, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{
                                            duration: 0.7,
                                            delay: 0.9 + i * 0.05,
                                            ease: EASE,
                                        }}
                                        style={{ height: `${h}%` }}
                                        className={`flex-1 origin-bottom rounded-[3px] ${
                                            i === 10 ? "bg-orbit-brand" : "bg-orbit-brand/25"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
