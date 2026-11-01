import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import Navbar from '../components/orbit-landing/Navbar';
import Hero from '../components/orbit-landing/Hero';
import Platforms from '../components/orbit-landing/Platforms';
import Features from '../components/orbit-landing/Features';
import HowItWorks from '../components/orbit-landing/HowItWorks';
import Showcase from '../components/orbit-landing/Showcase';
import FinalCTA from '../components/orbit-landing/FinalCTA';
import Footer from '../components/orbit-landing/Footer';
import AuthModal from '../components/orbit-landing/AuthModal';
import { initLenis } from '../components/orbit-landing/scroll';
import type { AuthMode } from '../components/orbit-landing/types';
import '../components/orbit-landing/orbit-landing.css';

export default function LandingPage() {
    const location = useLocation();
    const { theme } = useTheme();

    // /signin and /signup redirect here with an authMode so the Emergent
    // auth modal opens instead of the old auth pages.
    const initialMode = (location.state as { authMode?: AuthMode } | null)?.authMode;
    const [authOpen, setAuthOpen] = useState(Boolean(initialMode));
    const [authMode, setAuthMode] = useState<AuthMode>(initialMode ?? 'signup');

    const openAuth = (mode: AuthMode) => {
        setAuthMode(mode);
        setAuthOpen(true);
    };

    useEffect(() => {
        const destroy = initLenis();
        return destroy;
    }, []);

    return (
        <div className="orbit-landing min-h-screen overflow-x-clip bg-orbit-background orbit-font-sans text-orbit-foreground">
            <div
                aria-hidden
                className="orbit-noise pointer-events-none fixed inset-0 z-[60] opacity-[0.025]"
            />
            <Navbar onAuth={openAuth} />
            <main>
                <Hero onAuth={openAuth} />
                <Platforms />
                <Features />
                <HowItWorks />
                <Showcase />
                <FinalCTA onAuth={openAuth} />
            </main>
            <Footer />
            <AuthModal
                open={authOpen}
                onOpenChange={setAuthOpen}
                mode={authMode}
                onModeChange={setAuthMode}
            />
            <Toaster position="bottom-right" theme={theme} />
        </div>
    );
}
