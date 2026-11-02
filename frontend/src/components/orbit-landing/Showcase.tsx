import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { PlatformIcon, type PlatformKey } from "./Platforms";
import { Reveal } from "./Reveal";

const IMG_POST =
    "https://images.unsplash.com/photo-1637250037209-70d093732f44?auto=format&fit=crop&w=640&q=80";

type Status = "published" | "scheduled" | "draft";

interface Post {
    id: number;
    day: number;
    platform: PlatformKey;
    title: string;
    time: string;
    status: Status;
}

const POSTS: Post[] = [
    { id: 1, day: 2, platform: "Instagram", title: "Launch teaser", time: "10:30", status: "published" },
    { id: 2, day: 4, platform: "linkedin", title: "Founder story", time: "09:00", status: "published" },
    { id: 3, day: 9, platform: "X", title: "Weekly tips thread", time: "12:00", status: "scheduled" },
    { id: 4, day: 11, platform: "tiktok", title: "Behind the scenes", time: "17:30", status: "scheduled" },
    { id: 5, day: 16, platform: "Instagram", title: "Carousel · 5 slides", time: "11:00", status: "scheduled" },
    { id: 6, day: 18, platform: "Youtube", title: "Tutorial premiere", time: "15:00", status: "scheduled" },
    { id: 7, day: 21, platform: "linkedin", title: "Case study", time: "08:30", status: "draft" },
    { id: 8, day: 23, platform: "facebook", title: "Community Q&A", time: "13:00", status: "draft" },
    { id: 9, day: 26, platform: "Instagram", title: "Reel · month recap", time: "18:00", status: "scheduled" },
    { id: 10, day: 28, platform: "X", title: "Feature announcement", time: "10:00", status: "draft" },
];

const STATUS_STYLE: Record<Status, string> = {
    published: "bg-orbit-success/12 text-orbit-success border-orbit-success/25",
    scheduled: "bg-orbit-brand/12 text-orbit-brand border-orbit-brand/25",
    draft: "bg-orbit-warning/12 text-orbit-warning border-orbit-warning/25",
};

const PLATFORM_COLOR: Record<PlatformKey, string> = {
    Instagram: "#E1306C",
    facebook: "#1877F2",
    linkedin: "#0A66C2",
    X: "#0F1419",
    tiktok: "#0F1419",
    Youtube: "#FF0000",
};

const FILTERS: ("all" | PlatformKey)[] = ["all", "Instagram", "linkedin", "X", "tiktok"];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CELLS = [
    null, null, null, null, null, null, 1,
    2, 3, 4, 5, 6, 7, 8,
    9, 10, 11, 12, 13, 14, 15,
    16, 17, 18, 19, 20, 21, 22,
    23, 24, 25, 26, 27, 28, 29,
    30, null, null, null, null, null, null,
];

export default function Showcase() {
    const [view, setView] = useState<"month" | "week">("month");
    const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
    const [selectedId, setSelectedId] = useState<number>(5);

    const visible = useMemo(
        () => POSTS.filter((p) => filter === "all" || p.platform === filter),
        [filter],
    );
    const selected = POSTS.find((p) => p.id === selectedId) ?? POSTS[0];

    const postsByDay = (d: number | null) =>
        d === null ? [] : visible.filter((p) => p.day === d);

    return (
        <section id="showcase" data-testid="showcase-section" className="py-20 lg:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Reveal className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex items-center gap-2 orbit-font-mono text-xs uppercase tracking-[0.2em] text-orbit-brand">
                        <span className="h-px w-6 bg-orbit-brand/60" />
                        Product tour
                    </span>
                    <h2 className="mt-4 orbit-font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                        One calendar for{" "}
                        <em className="orbit-font-serif font-normal italic text-orbit-brand">
                            every
                        </em>{" "}
                        platform
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-orbit-muted-foreground">
                        Plan, review, and publish your whole month from a single
                        workspace.
                    </p>
                </Reveal>

                <Reveal delay={0.1} className="mt-12">
                    <div className="overflow-hidden rounded-[16px] border border-orbit-border bg-orbit-card shadow-[0_48px_90px_-40px_rgba(10,10,20,0.45)]">
                        {/* chrome */}
                        <div className="relative flex items-center gap-2 border-b border-orbit-border px-4 py-2.5">
                            <span className="flex gap-1.5">
                                <span className="size-2.5 rounded-full bg-orbit-foreground/15" />
                                <span className="size-2.5 rounded-full bg-orbit-foreground/15" />
                                <span className="size-2.5 rounded-full bg-orbit-foreground/15" />
                            </span>
                            <span className="absolute left-1/2 -translate-x-1/2 rounded-[10px] bg-orbit-foreground/5 px-3 py-1 orbit-font-mono text-[11px] text-orbit-muted-foreground">
                                orbit.app/calendar
                            </span>
                        </div>

                        <div className="grid lg:grid-cols-[210px_1fr]">
                            {/* sidebar */}
                            <aside className="hidden flex-col border-r border-orbit-border p-4 lg:flex">
                                <div className="flex items-center gap-2.5 rounded-[12px] border border-orbit-border bg-orbit-background p-2.5">
                                    <span className="grid size-7 place-items-center rounded-full bg-orbit-brand orbit-font-display text-xs font-semibold text-white">
                                        M
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-medium">Maya&apos;s Workspace</p>
                                        <p className="orbit-font-mono text-[9px] uppercase tracking-wider text-orbit-muted-foreground">
                                            12 accounts
                                        </p>
                                    </div>
                                </div>
                                <nav className="mt-4 space-y-1">
                                    {["Calendar", "Posts", "Assets", "Analytics", "Settings"].map(
                                        (item, i) => (
                                            <span
                                                key={item}
                                                className={`block rounded-[12px] px-3 py-1.5 text-xs ${
                                                    i === 0
                                                        ? "bg-orbit-brand/10 font-medium text-orbit-brand"
                                                        : "text-orbit-muted-foreground"
                                                }`}
                                            >
                                                {item}
                                            </span>
                                        ),
                                    )}
                                </nav>
                                <p className="mt-auto pt-6 orbit-font-mono text-[9px] uppercase tracking-wider text-orbit-muted-foreground">
                                    Connected
                                </p>
                                <div className="mt-2 space-y-1.5">
                                    {(["Instagram", "linkedin", "x"] as PlatformKey[]).map((k) => (
                                        <div key={k} className="flex items-center gap-2 text-[11px] text-orbit-muted-foreground">
                                            <span style={{ color: k === "X" ? "hsl(var(--orb-foreground))" : PLATFORM_COLOR[k] }}>
                                                <PlatformIcon platform={k} className="size-3" />
                                            </span>
                                            @{k}.orbit
                                            <span className="ml-auto size-1.5 rounded-full bg-orbit-success" />
                                        </div>
                                    ))}
                                </div>
                            </aside>

                            {/* calendar */}
                            <div className="p-4 sm:p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <button aria-label="Previous month" className="grid size-7 place-items-center rounded-[10px] border border-orbit-border text-orbit-muted-foreground hover:text-orbit-foreground">
                                            <ChevronLeft className="size-3.5" />
                                        </button>
                                        <span className="px-2 text-sm font-semibold">June 2025</span>
                                        <button aria-label="Next month" className="grid size-7 place-items-center rounded-[10px] border border-orbit-border text-orbit-muted-foreground hover:text-orbit-foreground">
                                            <ChevronRight className="size-3.5" />
                                        </button>
                                    </div>

                                    <div className="ml-2 flex rounded-[12px] border border-orbit-border bg-orbit-background p-0.5" data-testid="calendar-view-toggle">
                                        {(["month", "week"] as const).map((v) => (
                                            <button
                                                key={v}
                                                onClick={() => setView(v)}
                                                className={`rounded-[10px] px-3 py-1 text-[11px] font-medium capitalize transition-colors ${
                                                    view === v ? "bg-orbit-brand text-white" : "text-orbit-muted-foreground"
                                                }`}
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="ml-auto flex flex-wrap gap-1.5">
                                        {FILTERS.map((f) => (
                                            <button
                                                key={f}
                                                data-testid={`calendar-filter-${f}`}
                                                onClick={() => setFilter(f)}
                                                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                                                    filter === f
                                                        ? "border-orbit-brand/40 bg-orbit-brand/10 text-orbit-brand"
                                                        : "border-orbit-border text-orbit-muted-foreground hover:text-orbit-foreground"
                                                }`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {view === "month" ? (
                                    <div className="mt-4 grid grid-cols-7 gap-px overflow-hidden rounded-[12px] border border-orbit-border bg-border">
                                        {DAYS.map((d) => (
                                            <div key={d} className="bg-orbit-card px-2 py-1.5 text-center orbit-font-mono text-[9px] uppercase tracking-wider text-orbit-muted-foreground">
                                                {d}
                                            </div>
                                        ))}
                                        {CELLS.map((d, i) => (
                                            <div
                                                key={i}
                                                className={`min-h-[72px] bg-orbit-card p-1.5 md:min-h-[88px] ${
                                                    d === null ? "opacity-40" : ""
                                                }`}
                                            >
                                                {d !== null && (
                                                    <>
                                                        <span className="text-[10px] text-orbit-muted-foreground">{d}</span>
                                                        <div className="mt-1 space-y-1">
                                                            {postsByDay(d).map((p) => {
                                                                const mono = p.platform === "X" || p.platform === "tiktok";
                                                                const color = mono ? "hsl(var(--orb-foreground))" : PLATFORM_COLOR[p.platform];
                                                                return (
                                                                    <button
                                                                        key={p.id}
                                                                        data-testid="calendar-post-item"
                                                                        onClick={() => setSelectedId(p.id)}
                                                                        className={`flex w-full items-center gap-1 rounded-[5px] px-1.5 py-1 text-left text-[10px] transition-colors ${
                                                                            selectedId === p.id
                                                                                ? "ring-1 ring-orbit-brand"
                                                                                : ""
                                                                        }`}
                                                                        style={{
                                                                            backgroundColor: mono
                                                                                ? "hsl(var(--orb-foreground) / 0.07)"
                                                                                : `${PLATFORM_COLOR[p.platform]}14`,
                                                                            color: color,
                                                                        }}
                                                                    >
                                                                        <span
                                                                            className="size-1.5 shrink-0 rounded-full"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    p.status === "published"
                                                                                        ? "hsl(var(--orb-success))"
                                                                                        : p.status === "scheduled"
                                                                                          ? "hsl(var(--orb-brand))"
                                                                                          : "hsl(var(--orb-warning))",
                                                                            }}
                                                                        />
                                                                        <span className="shrink-0 orbit-font-mono opacity-80">{p.time}</span>
                                                                        <span className="truncate">{p.title}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                                        {DAYS.map((d, i) => {
                                            const day = [16, 17, 18, 19, 20, 21, 22][i];
                                            return (
                                                <div key={d} className="min-h-[180px] rounded-[12px] border border-orbit-border bg-orbit-background p-2">
                                                    <p className="text-center orbit-font-mono text-[9px] uppercase tracking-wider text-orbit-muted-foreground">
                                                        {d} {day}
                                                    </p>
                                                    <div className="mt-2 space-y-1.5">
                                                        {postsByDay(day).map((p) => (
                                                            <button
                                                                key={p.id}
                                                                data-testid="calendar-post-item"
                                                                onClick={() => setSelectedId(p.id)}
                                                                className="block w-full rounded-[10px] border border-orbit-border bg-orbit-card px-2 py-1.5 text-left text-[10px]"
                                                            >
                                                                <span className="orbit-font-mono text-orbit-muted-foreground">{p.time}</span>
                                                                <span className="mt-0.5 block truncate">{p.title}</span>
                                                            </button>
                                                        ))}
                                                        {postsByDay(day).length === 0 && (
                                                            <p className="pt-6 text-center text-[10px] text-orbit-muted-foreground">Free</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* quick add */}
                                <form
                                    className="mt-4 flex items-center gap-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        toast.success("Post scheduled for June 21 (demo)");
                                    }}
                                >
                                    <input
                                        data-testid="calendar-quick-add-input"
                                        placeholder="Add a post for June 21…"
                                        className="h-9 flex-1 rounded-[12px] border border-orbit-border bg-orbit-background px-3 text-xs outline-none transition-colors placeholder:text-orbit-muted-foreground focus:border-orbit-brand/50"
                                    />
                                    <button
                                        data-testid="calendar-quick-add-submit"
                                        type="submit"
                                        className="inline-flex h-9 items-center gap-1.5 rounded-[12px] bg-orbit-brand px-3 text-xs font-medium text-white transition-opacity hover:opacity-90"
                                    >
                                        <Plus className="size-3.5" /> Schedule
                                    </button>
                                </form>
                            </div>

                            {/* preview panel */}
                            <aside className="border-t border-orbit-border p-4 sm:p-5 lg:w-[280px] lg:border-l lg:border-t-0">
                                <div data-testid="calendar-post-preview-panel">
                                    <p className="orbit-font-mono text-[9px] uppercase tracking-wider text-orbit-muted-foreground">
                                        Post preview
                                    </p>
                                    <div className="mt-3 overflow-hidden rounded-[12px] border border-orbit-border bg-orbit-background">
                                        <div className="h-28 w-full overflow-hidden">
                                            <img
                                                src={IMG_POST}
                                                alt="Post preview"
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    style={{
                                                        color:
                                                            selected.platform === "X" || selected.platform === "tiktok"
                                                                ? "hsl(var(--orb-foreground))"
                                                                : PLATFORM_COLOR[selected.platform],
                                                    }}
                                                >
                                                    <PlatformIcon platform={selected.platform} className="size-3.5" />
                                                </span>
                                                <span className="text-[11px] text-orbit-muted-foreground">
                                                    @{selected.platform}.orbit
                                                </span>
                                                <span
                                                    className={`ml-auto rounded-full border px-2 py-0.5 text-[9px] font-medium capitalize ${STATUS_STYLE[selected.status]}`}
                                                >
                                                    {selected.status}
                                                </span>
                                            </div>
                                            <p className="mt-2.5 text-xs font-medium">{selected.title}</p>
                                            <p className="mt-1 text-[11px] leading-relaxed text-orbit-muted-foreground">
                                                {selected.status === "draft"
                                                    ? "Draft saved — pick a time to schedule."
                                                    : `Publishing ${selected.status} · Jun ${selected.day} at ${selected.time}`}
                                            </p>
                                            <div className="mt-3 flex gap-1.5">
                                                <button
                                                    data-testid="calendar-post-edit"
                                                    onClick={() => toast.success("Opening editor (demo)")}
                                                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-[10px] border border-orbit-border py-1.5 text-[11px] font-medium hover:border-orbit-brand/40"
                                                >
                                                    <Pencil className="size-3" /> Edit
                                                </button>
                                                <button
                                                    data-testid="calendar-post-duplicate"
                                                    onClick={() => toast.success("Post duplicated (demo)")}
                                                    className="flex-1 rounded-[10px] bg-orbit-brand py-1.5 text-[11px] font-medium text-white hover:opacity-90"
                                                >
                                                    Duplicate
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {[
                                            { l: "Published", v: POSTS.filter((p) => p.status === "published").length, c: "bg-orbit-success" },
                                            { l: "Scheduled", v: POSTS.filter((p) => p.status === "scheduled").length, c: "bg-orbit-brand" },
                                            { l: "Drafts", v: POSTS.filter((p) => p.status === "draft").length, c: "bg-orbit-warning" },
                                        ].map((s) => (
                                            <div key={s.l} className="flex items-center gap-2 text-[11px]">
                                                <span className={`size-1.5 rounded-full ${s.c}`} />
                                                <span className="text-orbit-muted-foreground">{s.l}</span>
                                                <span className="ml-auto orbit-font-mono font-medium">{s.v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
