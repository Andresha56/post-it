import { Logo } from './Logo';

const footerLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' }
];

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Logo />
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">
          {footerLinks.map((link) => <a key={link.href} href={link.href} className="hover:text-[var(--text)]">{link.label}</a>)}
        </nav>
      </div>
    </footer>
  );
}
