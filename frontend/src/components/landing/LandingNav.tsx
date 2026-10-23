import { Logo } from './Logo';
import { LinkButton } from './LinkButton';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' }
];

export function LandingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--app-bg)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-10">
          <Logo />
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">{link.label}</a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LinkButton to="/signin" variant="ghost">Sign in</LinkButton>
          <LinkButton to="/signup">Sign up</LinkButton>
        </div>
      </div>
    </header>
  );
}
