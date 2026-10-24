import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={cn('rounded-lg border border-[var(--border)] bg-[var(--surface)]', className)} {...props} />;
}
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-start justify-between gap-3 px-4 pt-4', className)} {...props} />;
}
export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 pb-4', className)} {...props} />;
}
export function CardTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="min-w-0">
      <h2 className="text-sm font-semibold text-[var(--text)]">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{description}</p>}
    </div>
  );
}
