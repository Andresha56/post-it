import { InstagramIcon, FacebookIcon, LinkedInIcon, XIcon, TikTokIcon, YouTubeIcon } from "./icons";

export type PlatformKey =
    | "instagram"
    | "facebook"
    | "linkedin"
    | "x"
    | "tiktok"
    | "youtube";

export const PLATFORMS: { key: PlatformKey; name: string; color: string; mono: boolean }[] = [
    { key: "instagram", name: "Instagram", color: "#E1306C", mono: false },
    { key: "facebook", name: "Facebook", color: "#1877F2", mono: false },
    { key: "linkedin", name: "LinkedIn", color: "#0A66C2", mono: false },
    { key: "x", name: "X", color: "#0F1419", mono: true },
    { key: "tiktok", name: "TikTok", color: "#0F1419", mono: true },
    { key: "youtube", name: "YouTube", color: "#FF0000", mono: false },
];

export function PlatformIcon({
    platform,
    className,
}: {
    platform: PlatformKey;
    className?: string;
}) {
    const cls = className ?? "size-4";
    switch (platform) {
        case "instagram":
            return <InstagramIcon className={cls} />;
        case "facebook":
            return <FacebookIcon className={cls} />;
        case "linkedin":
            return <LinkedInIcon className={cls} />;
        case "x":
            return <XIcon className={cls} />;
        case "tiktok":
            return <TikTokIcon className={cls} />;
        case "youtube":
            return <YouTubeIcon className={cls} />;
    }
}

function PlatformCard({ p, mirror = false }: { p: (typeof PLATFORMS)[number]; mirror?: boolean }) {
    return (
        <div
            data-testid={mirror ? undefined : `platform-card-${p.key}`}
            aria-hidden={mirror || undefined}
            className="group flex items-center gap-3 rounded-[12px] border border-orbit-border bg-orbit-card px-5 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-orbit-brand/50"
        >
            <span
                className="grid size-8 place-items-center rounded-[12px] transition-transform duration-300 group-hover:scale-110"
                style={{
                    backgroundColor: p.mono
                        ? "hsl(var(--orb-foreground) / 0.06)"
                        : `${p.color}1f`,
                    color: p.mono ? "hsl(var(--orb-foreground))" : p.color,
                }}
            >
                <PlatformIcon platform={p.key} className="size-4" />
            </span>
            <span className="text-sm font-medium">{p.name}</span>
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-orbit-success/10 px-2 py-0.5 text-[11px] font-medium text-orbit-success">
                <span className="size-1.5 rounded-full bg-orbit-success" />
                Connected
            </span>
        </div>
    );
}

export default function Platforms() {
    return (
        <section
            data-testid="integrations-strip"
            className="border-y border-orbit-border bg-orbit-surface/60 py-14"
        >
            <p className="text-center orbit-font-mono text-xs uppercase tracking-[0.22em] text-orbit-muted-foreground">
                Publish everywhere your audience lives
            </p>
            <div className="orbit-mask-x group mt-8 overflow-hidden">
                <div className="flex w-max orbit-marquee-track gap-4 group-hover:[animation-play-state:paused]">
                    <div className="flex gap-4 pr-4">
                        {PLATFORMS.map((p) => (
                            <PlatformCard key={p.key} p={p} />
                        ))}
                    </div>
                    <div className="flex gap-4 pr-4">
                        {PLATFORMS.map((p) => (
                            <PlatformCard key={`m-${p.key}`} p={p} mirror />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
