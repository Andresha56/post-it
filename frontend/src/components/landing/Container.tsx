import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

// 1200px of content at desktop widths, 24px gutters below that.
export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-[1248px] px-6', className)}>{children}</div>;
}
