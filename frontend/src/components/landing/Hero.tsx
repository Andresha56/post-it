import { ArrowRight, ArrowUpRight, CircleDot, Sparkles } from 'lucide-react';
import { BrowserFrame } from './BrowserFrame';
import { Container } from './Container';
import { LinkButton } from './LinkButton';
import { ThemedImage } from '../ui/ThemedImage';
import { DASHBOARD_PREVIEW, HERO } from '../../constant/landing';
import { AppRoute } from '../../constant/routes';
import { LandingSectionId } from '../../types/landing';

export function Hero() {
  return (
    <section className="pt-11 lg:pt-[66px]">
      <Container className="flex flex-col items-center text-center">
        <a href={`#${LandingSectionId.Features}`} className="inline-flex h-[30px] items-center gap-2 rounded-full bg-primary-light px-2.5 text-[11px] font-medium text-primary transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Sparkles size={14} aria-hidden="true" />
          {HERO.badge}
          <ArrowUpRight size={12} aria-hidden="true" />
        </a>
        <h1 className="mt-[21px] text-[44px] font-bold leading-[1.06] tracking-[-0.01em] text-[var(--text)] sm:text-6xl lg:text-[72px] lg:leading-[1.09]">
          <span className="block">{HERO.titleLead}</span>
          <span className="block text-primary">{HERO.titleAccent}</span>
        </h1>
        <p className="mt-[22px] max-w-[580px] text-base leading-[26px] text-[var(--text-muted)] sm:text-lg sm:leading-[30px]">{HERO.description}</p>
        <LinkButton to={AppRoute.SignUp} size="lg" className="mt-[22px] w-full sm:w-auto">{HERO.cta} <ArrowRight size={16} aria-hidden="true" /></LinkButton>

        <div className="mt-16 w-full lg:mt-24">
          <BrowserFrame url={DASHBOARD_PREVIEW.url}>
            <ThemedImage {...DASHBOARD_PREVIEW.image} loading="eager" className="block h-auto w-full" />
          </BrowserFrame>
          <p className="mt-[18px] flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-subtle)]"><CircleDot size={14} className="text-primary" aria-hidden="true" />{DASHBOARD_PREVIEW.caption}</p>
        </div>
      </Container>
    </section>
  );
}
