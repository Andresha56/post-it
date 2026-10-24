import type { PostStatus } from '../../types';
import { cn } from '../../lib/utils';

const dots: Record<PostStatus, string> = {
  Published: 'bg-emerald-500',
  Scheduled: 'bg-blue-500',
  Draft: 'bg-slate-400',
  'Needs Review': 'bg-orange-500',
  Failed: 'bg-red-500'
};

export function StatusBadge({ status, className }: { status: PostStatus; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-[var(--text-muted)]', className)}>
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', dots[status])} />
      {status}
    </span>
  );
}
