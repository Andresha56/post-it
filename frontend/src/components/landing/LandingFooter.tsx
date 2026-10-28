import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { Logo } from './Logo';
import { BRAND, COPYRIGHT_YEAR, FOOTER_GROUPS } from '../../constant/landing';
import type { FooterGroup } from '../../types/landing';

const linkClass = 'text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

const FooterLinks = memo(function FooterLinks({ title, links }: FooterGroup) {
  return (
    <nav aria-label={title}>
      <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {'to' in link
              ? <Link to={link.to} className={linkClass}>{link.label}</Link>
              : <a href={link.href} className={linkClass}>{link.label}</a>}
          </li>
        ))}
      </ul>
    </nav>
  );
});

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--border)]">
      <Container className="grid gap-10 py-14 sm:grid-cols-[1fr_auto] sm:gap-20">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-muted)]">{BRAND.tagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-12 sm:gap-20">
          {FOOTER_GROUPS.map((group) => <FooterLinks key={group.title} {...group} />)}
        </div>
      </Container>
      <Container className="border-t border-[var(--border)] py-6">
        <p className="text-xs text-[var(--text-muted)]">© {COPYRIGHT_YEAR} {BRAND.name}. All rights reserved.</p>
      </Container>
    </footer>
  );
}
