import type { PostStatus } from '../../types';
import { cn } from '../../lib/utils';

const dots: Record<PostStatus, string> = {
  Published: 'bg-success',
  Scheduled: 'bg-info',
  Draft: 'bg-[var(--text-muted)]',
  'Needs Review': 'bg-warning',
  Failed: 'bg-error'
};

export function StatusBadge({ status, className }: { status: PostStatus; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-[var(--text-muted)]', className)}>
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', dots[status])} />
      {status}
    </span>
  );
}
