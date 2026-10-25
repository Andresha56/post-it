import { ArrowRight } from 'lucide-react';
import { LinkButton } from './LinkButton';
import { ProductPreview } from './ProductPreview';

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pb-32 lg:pt-28">
      <div>
        <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-[var(--text)] sm:text-5xl lg:text-[56px]">
          Plan your posts. Let them publish themselves.
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--text-muted)]">
          Connect your social accounts, write once, and pick a time on the calendar. Orbit publishes at the moment you chose and keeps every status in one place.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <LinkButton to="/signup" size="lg">Get started <ArrowRight size={17} /></LinkButton>
          <LinkButton to="/signin" variant="secondary" size="lg">Sign in</LinkButton>
        </div>
      </div>
      <div className="pb-8 sm:pl-8">
        <ProductPreview />
      </div>
    </section>
  );
}
