import { memo } from 'react';
import { Container } from './Container';
import { SectionHeader } from './SectionHeader';
import { FEATURES, FEATURES_SECTION } from '../../constant/landing';
import { LandingSectionId, type FeatureItem } from '../../types/landing';

const FeatureCard = memo(function FeatureCard({ icon: Icon, title, description }: FeatureItem) {
  return (
    <li className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:border-primary/50">
      <span className="grid size-11 place-items-center rounded-xl bg-primary-light text-primary"><Icon size={20} strokeWidth={1.8} /></span>
      <h3 className="mt-5 text-lg font-semibold text-[var(--text)]">{title}</h3>
      <p className="mt-2 leading-relaxed text-[var(--text-muted)]">{description}</p>
    </li>
  );
});

export function Features() {
  return (
    <section id={LandingSectionId.Features} className="scroll-mt-24 py-20 lg:py-28">
      <Container>
        <SectionHeader {...FEATURES_SECTION} />
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ id, ...feature }) => <FeatureCard key={id} id={id} {...feature} />)}
        </ul>
      </Container>
    </section>
  );
}
