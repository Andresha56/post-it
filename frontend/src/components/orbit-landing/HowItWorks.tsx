import { Link2, CalendarClock, Wand2 } from "lucide-react";
import { Reveal } from "./Reveal";

const STEPS = [
    {
        n: "01",
        icon: Link2,
        title: "Connect your accounts",
        desc: "Link every social profile in one click and manage them from a single dashboard.",
    },
    {
        n: "02",
        icon: Wand2,
        title: "Create content with AI or manually",
        desc: "Draft captions, visuals, and ideas with AI assistance — or bring your own.",
    },
    {
        n: "03",
        icon: CalendarClock,
        title: "Schedule and publish everywhere",
        desc: "Queue posts for the perfect moment and publish across every platform at once.",
    },
];

export default function HowItWorks() {
    return (
        <section
            id="how-it-works"
            data-testid="how-it-works-section"
            className="border-y border-orbit-border bg-orbit-surface/60 py-20 lg:py-32"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Reveal className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex items-center gap-2 orbit-font-mono text-xs uppercase tracking-[0.2em] text-orbit-brand">
                        How it works
                        <span className="h-px w-6 bg-orbit-brand/60" />
                    </span>
                    <h2 className="mt-4 orbit-font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                        From blank page to published in{" "}
                        <em className="orbit-font-serif font-normal italic text-orbit-brand">
                            minutes
                        </em>
                    </h2>
                </Reveal>

                <div className="relative mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
                    <div
                        aria-hidden
                        className="absolute left-[16%] right-[16%] top-7 hidden border-t border-dashed border-orbit-border md:block"
                    />
                    {STEPS.map((s, i) => (
                        <Reveal key={s.n} delay={i * 0.12}>
                            <div
                                data-testid={`step-item-${i + 1}`}
                                className="relative flex flex-col items-center gap-4 text-center"
                            >
                                <span className="relative z-10 grid size-14 place-items-center rounded-full border border-orbit-border bg-orbit-card orbit-font-mono text-sm font-medium text-orbit-brand shadow-sm">
                                    {s.n}
                                </span>
                                <div>
                                    <h3 className="orbit-font-display text-lg font-semibold tracking-tight">
                                        {s.title}
                                    </h3>
                                    <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-orbit-muted-foreground">
                                        {s.desc}
                                    </p>
                                </div>
                                <span className="grid size-9 place-items-center rounded-[12px] border border-orbit-border bg-orbit-card text-orbit-muted-foreground">
                                    <s.icon className="size-4" />
                                </span>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
