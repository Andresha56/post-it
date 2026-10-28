import { Container } from './Container';
import { SectionHeader } from './SectionHeader';
import { ShowcaseRow } from './ShowcaseRow';
import { SHOWCASES, SHOWCASE_SECTION } from '../../constant/landing';

export function ProductShowcase() {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <SectionHeader {...SHOWCASE_SECTION} />
        <div className="mt-16 space-y-20 lg:space-y-28">
          {SHOWCASES.map(({ id, ...showcase }, index) => <ShowcaseRow key={id} {...showcase} isReversed={index % 2 === 1} />)}
        </div>
      </Container>
    </section>
  );
}
