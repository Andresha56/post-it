import type { ReactNode } from 'react';
import { Ellipsis, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';

const WINDOW_DOTS = ['bg-[#ed9998]', 'bg-[#e9c079]', 'bg-[#87bea0]'];

type Props = { url: string; children: ReactNode; className?: string };

// Browser chrome around a product screenshot.
export function BrowserFrame({ url, children, className }: Props) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_32px_80px_-32px_rgba(25,25,35,0.22)] dark:shadow-[0_32px_80px_-32px_rgba(0,0,0,0.7)]', className)}>
      <div className="grid h-[34px] grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--border)] bg-[var(--surface-muted)] px-3.5" aria-hidden="true">
        <div className="flex gap-1.5">
          {WINDOW_DOTS.map((dot) => <span key={dot} className={cn('size-1.5 rounded-full', dot)} />)}
        </div>
        <p className="flex items-center gap-1.5 text-[10px] text-[var(--text-subtle)]"><Lock size={10} />{url}</p>
        <Ellipsis size={14} className="justify-self-end text-[var(--text-subtle)]" />
      </div>
      {children}
    </div>
  );
}
