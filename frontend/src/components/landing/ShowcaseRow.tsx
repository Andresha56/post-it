import { memo } from 'react';
import { Check } from 'lucide-react';
import { BrowserFrame } from './BrowserFrame';
import { ThemedImage } from '../ui/ThemedImage';
import { cn } from '../../lib/utils';
import type { ShowcaseItem } from '../../types/landing';

type Props = Omit<ShowcaseItem, 'id'> & { isReversed: boolean };

export const ShowcaseRow = memo(function ShowcaseRow({ icon: Icon, eyebrow, title, description, points, url, image, isReversed }: Props) {
  return (
    <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={cn(isReversed && 'lg:order-2')}>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
          <Icon size={13} aria-hidden="true" />
          {eyebrow}
        </span>
        <h3 className="mt-4 text-balance text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">{title}</h3>
        <p className="mt-4 max-w-lg leading-relaxed text-[var(--text-muted)] sm:text-lg">{description}</p>
        <ul className="mt-6 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-center gap-3 text-[var(--text)]">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Check size={12} strokeWidth={3} aria-hidden="true" /></span>
              {point}
            </li>
          ))}
        </ul>
      </div>
      <BrowserFrame url={url}>
        <ThemedImage {...image} className="block h-auto w-full" />
      </BrowserFrame>
    </article>
  );
});
