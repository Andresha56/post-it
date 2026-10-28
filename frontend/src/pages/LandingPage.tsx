import { lazy, Suspense } from 'react';
import { LandingNav } from '../components/landing/LandingNav';
import { Hero } from '../components/landing/Hero';
import { PlatformStrip } from '../components/landing/PlatformStrip';
import { LandingFooter } from '../components/landing/LandingFooter';

// Below-the-fold sections load as separate chunks so the hero renders first.
const Features = lazy(() => import('../components/landing/Features').then((m) => ({ default: m.Features })));
const ProductShowcase = lazy(() => import('../components/landing/ProductShowcase').then((m) => ({ default: m.ProductShowcase })));
const HowItWorks = lazy(() => import('../components/landing/HowItWorks').then((m) => ({ default: m.HowItWorks })));
const FinalCta = lazy(() => import('../components/landing/FinalCta').then((m) => ({ default: m.FinalCta })));

// Reserves space so the footer does not jump while the sections load.
const sectionsFallback = <div className="min-h-screen" aria-hidden="true" />;

export default function LandingPage() {
  return (
    <div className="landing min-h-screen overflow-x-clip">
      <LandingNav />
      <main>
        <Hero />
        <PlatformStrip />
        <Suspense fallback={sectionsFallback}>
          <Features />
          <ProductShowcase />
          <HowItWorks />
          <FinalCta />
        </Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}
