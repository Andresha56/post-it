import { memo } from 'react';
import { Container } from './Container';
import { INTEGRATIONS, INTEGRATIONS_HEADING } from '../../constant/landing';
import type { IntegrationItem } from '../../types/landing';

const PlatformItem = memo(function PlatformItem({ platform, icon: Icon, iconSize }: IntegrationItem) {
  return (
    <li className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)] sm:text-[17px]">
      {/* Fixed 20px slot keeps spacing identical while each brand glyph keeps its own optical size. */}
      <span className="grid size-5 shrink-0 place-items-center max-sm:scale-90"><Icon size={iconSize} /></span>
      {platform}
    </li>
  );
});

export function PlatformStrip() {
  return (
    <section aria-label={INTEGRATIONS_HEADING} className="pb-[60px] pt-[59px]">
      <Container>
        <p className="text-center text-[11px] font-medium uppercase text-[var(--text-subtle)]">{INTEGRATIONS_HEADING}</p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-5 sm:gap-x-[54px]">
          {INTEGRATIONS.map((item) => <PlatformItem key={item.platform} {...item} />)}
        </ul>
      </Container>
    </section>
  );
}
