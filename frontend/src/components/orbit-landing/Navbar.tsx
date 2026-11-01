import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { scrollToId } from "./scroll";
import Logo from "./Logo";
import type { AuthMode } from "./types";

const LINKS = [
    { label: "Product", id: "showcase" },
    { label: "Features", id: "features" },
    { label: "How it works", id: "how-it-works" },
];

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            data-testid="nav-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="grid size-9 place-items-center rounded-[12px] border border-orbit-border bg-orbit-card text-orbit-muted-foreground transition-all duration-300 hover:border-orbit-brand/50 hover:text-orbit-foreground"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={theme}
                    initial={{ rotate: -60, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 60, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.25 }}
                    className="grid place-items-center"
                >
                    {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </motion.span>
            </AnimatePresence>
        </button>
    );
}

export default function Navbar({ onAuth }: { onAuth: (m: AuthMode) => void }) {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const go = (id: string) => {
        setOpen(false);
        scrollToId(id);
    };

    return (
        <header
            data-testid="nav-header"
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? "border-b border-orbit-border/70 bg-orbit-background/70 backdrop-blur-xl"
                    : "border-b border-transparent bg-transparent"
            }`}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <a
                    href="#"
                    data-testid="nav-logo-link"
                    onClick={(e) => {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        setOpen(false);
                    }}
                    className="transition-opacity hover:opacity-80"
                >
                    <Logo />
                </a>

                <nav className="hidden items-center gap-1 md:flex">
                    {LINKS.map((l) => (
                        <button
                            key={l.id}
                            data-testid={`nav-link-${l.id}`}
                            onClick={() => go(l.id)}
                            className="rounded-[12px] px-3.5 py-2 text-sm text-orbit-muted-foreground transition-colors hover:bg-orbit-foreground/5 hover:text-orbit-foreground"
                        >
                            {l.label}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-2.5">
                    <ThemeToggle />
                    <button
                        data-testid="nav-login-btn"
                        onClick={() => onAuth("login")}
                        className="hidden h-9 items-center rounded-[12px] px-4 text-sm font-medium text-orbit-muted-foreground transition-colors hover:text-orbit-foreground sm:inline-flex"
                    >
                        Login
                    </button>
                    <button
                        data-testid="nav-get-started-btn"
                        onClick={() => onAuth("signup")}
                        className="hidden h-9 items-center rounded-[12px] bg-orbit-brand px-4 text-sm font-medium text-white transition-all duration-300 hover:opacity-90 sm:inline-flex"
                    >
                        Get Started
                    </button>
                    <button
                        data-testid="nav-mobile-menu-toggle"
                        aria-label="Toggle menu"
                        onClick={() => setOpen((o) => !o)}
                        className="grid size-9 place-items-center rounded-[12px] border border-orbit-border bg-orbit-card text-orbit-foreground md:hidden"
                    >
                        {open ? <X className="size-4" /> : <Menu className="size-4" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="border-b border-orbit-border bg-orbit-background/95 backdrop-blur-xl md:hidden"
                    >
                        <div className="space-y-1 px-4 py-4">
                            {LINKS.map((l) => (
                                <button
                                    key={l.id}
                                    onClick={() => go(l.id)}
                                    className="block w-full rounded-[12px] px-3 py-2.5 text-left text-base text-orbit-foreground transition-colors hover:bg-orbit-foreground/5"
                                >
                                    {l.label}
                                </button>
                            ))}
                            <div className="flex gap-3 pt-3">
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        onAuth("login");
                                    }}
                                    className="h-10 flex-1 rounded-[12px] border border-orbit-border text-sm font-medium"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        onAuth("signup");
                                    }}
                                    className="h-10 flex-1 rounded-[12px] bg-orbit-brand text-sm font-medium text-white"
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
