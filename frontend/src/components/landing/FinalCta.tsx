import { ArrowRight } from 'lucide-react';
import { Container } from './Container';
import { LinkButton } from './LinkButton';
import { FINAL_CTA} from '../../constant/landing';
import { AppRoute } from '../../constant/routes';

export function FinalCta() {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-b from-primary-subtle to-[var(--surface)] px-6 py-14 text-center sm:px-12 lg:py-20">
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl lg:text-[44px] lg:leading-[1.1]">{FINAL_CTA.title}</h2>
          <p className="mx-auto mt-4 max-w-md text-pretty leading-relaxed text-[var(--text-muted)] sm:text-lg">{FINAL_CTA.description}</p>
          <LinkButton to={AppRoute.SignUp} size="lg" className="mt-8 w-full sm:w-auto">{FINAL_CTA.cta} <ArrowRight size={17} aria-hidden="true" /></LinkButton>
          
        </div>
      </Container>
    </section>
  );
}
