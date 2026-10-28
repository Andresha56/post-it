import { memo } from 'react';
import { Container } from './Container';
import { SectionHeader } from './SectionHeader';
import { HOW_IT_WORKS_SECTION, STEPS } from '../../constant/landing';
import { LandingSectionId, type StepItem } from '../../types/landing';

type StepProps = Omit<StepItem, 'id'> & { position: number };

const Step = memo(function Step({ position, title, description }: StepProps) {
  return (
    <li className="rounded-2xl border border-[var(--border)] bg-[var(--app-bg)] p-6">
      <span className="grid size-10 place-items-center rounded-full bg-primary text-sm font-semibold tabular-nums text-primary-foreground">{position}</span>
      <h3 className="mt-5 text-lg font-semibold text-[var(--text)]">{title}</h3>
      <p className="mt-2 leading-relaxed text-[var(--text-muted)]">{description}</p>
    </li>
  );
});

export function HowItWorks() {
  return (
    <section id={LandingSectionId.HowItWorks} className="scroll-mt-24 border-y border-[var(--border)] bg-[var(--surface)] py-20 lg:py-28">
      <Container>
        <SectionHeader {...HOW_IT_WORKS_SECTION} />
        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map(({ id, ...step }, index) => <Step key={id} position={index + 1} {...step} />)}
        </ol>
      </Container>
    </section>
  );
}
