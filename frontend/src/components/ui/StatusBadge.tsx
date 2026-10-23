import type { PostStatus } from '../../types';
import { cn } from '../../lib/utils';

const styles: Record<PostStatus, string> = {
  Published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  Scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'Needs Review': 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  Failed: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
};

export function StatusBadge({ status, className }: { status: PostStatus; className?: string }) {
  return <span className={cn('inline-flex whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-semibold', styles[status], className)}>{status}</span>;
}
