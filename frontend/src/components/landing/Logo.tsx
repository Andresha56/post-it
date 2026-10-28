import { Link } from 'react-router-dom';
import { BRAND } from '../../constant/landing';
import { AppRoute } from '../../constant/routes';
import { cn } from '../../lib/utils';

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link to={AppRoute.Home} aria-label={`${BRAND.name} home`} className={cn('inline-flex items-center gap-2.5 rounded-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2', light ? 'text-white' : 'text-[var(--text)]', className)}>
      <span className="grid size-[30px] place-items-center rounded-lg bg-primary text-primary-foreground">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 17 12.5 5.5 18 24.5 23.5 12.5" />
          <path d="M7.5 21.5 11 14M19.5 19.5 23 11.5" strokeWidth="1.8" opacity=".7" />
        </svg>
      </span>
      <span className="text-[25px] leading-none tracking-[-0.02em]">{BRAND.wordmark}</span>
    </Link>
  );
}
