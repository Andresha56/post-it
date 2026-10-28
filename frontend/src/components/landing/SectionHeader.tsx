import { memo } from 'react';

type Props = { eyebrow: string; title: string; description: string; id?: string };

export const SectionHeader = memo(function SectionHeader({ eyebrow, title, description, id }: Props) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold text-primary">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-balance text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl lg:text-[44px] lg:leading-[1.1]">{title}</h2>
      <p className="mt-4 text-pretty text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">{description}</p>
    </div>
  );
});
