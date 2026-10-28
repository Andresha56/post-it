import { useCallback, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { Container } from './Container';
import { LinkButton } from './LinkButton';
import { ThemeToggle } from '../ui/ThemeToggle';
import { NAV_ACTIONS, NAV_LINKS } from '../../constant/landing';
import { AppRoute } from '../../constant/routes';

const MOBILE_MENU_ID = 'landing-mobile-menu';
const linkClass = 'rounded text-[13px] font-medium text-[var(--text-muted)] transition hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

export function LandingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setIsMenuOpen((open) => !open), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') closeMenu(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen, closeMenu]);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--app-bg)]">
      <Container className="flex h-[76px] items-center justify-between lg:h-[83px]">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => <a key={link.href} href={link.href} className={linkClass}>{link.label}</a>)}
        </nav>
        <div className="flex items-center gap-3 md:gap-[22px]">
          <ThemeToggle />
          <LinkButton to={AppRoute.SignIn} variant="ghost" className="hidden min-h-0 px-0 md:inline-flex">{NAV_ACTIONS.signIn}</LinkButton>
          <LinkButton to={AppRoute.SignUp} className="hidden md:inline-flex">{NAV_ACTIONS.signUp}</LinkButton>
          <button
            type="button"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls={MOBILE_MENU_ID}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="grid size-8 place-items-center rounded-lg text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
          >
            {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </Container>
      {isMenuOpen && (
        <div id={MOBILE_MENU_ID} className="border-t border-[var(--border)] bg-[var(--app-bg)] md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => <a key={link.href} href={link.href} onClick={closeMenu} className={linkClass}>{link.label}</a>)}
            <div className="mt-3 flex flex-col gap-2">
              <LinkButton to={AppRoute.SignIn} variant="ghost" onClick={closeMenu}>{NAV_ACTIONS.signIn}</LinkButton>
              <LinkButton to={AppRoute.SignUp} onClick={closeMenu}>{NAV_ACTIONS.signUp}</LinkButton>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
