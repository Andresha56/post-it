import Lenis from "lenis";

let lenis: Lenis | null = null;
let rafId = 0;

export function initLenis(): () => void {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
        cancelAnimationFrame(rafId);
        lenis?.destroy();
        lenis = null;
    };
}

export function scrollToId(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) {
        lenis.scrollTo(el, { offset: -72, duration: 1.3 });
    } else {
        el.scrollIntoView({ behavior: "smooth" });
    }
}
