import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '../../lib/utils';

type Props = LinkProps & { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'md' | 'lg' };

// Router link styled to match the shared Button component.
export function LinkButton({ className, variant = 'primary', size = 'md', ...props }: Props) {
  return (
    <Link
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        variant === 'primary' && 'bg-brand-600 text-white shadow-sm hover:bg-brand-700',
        variant === 'secondary' && 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-muted)]',
        variant === 'ghost' && 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]',
        size === 'md' && 'min-h-10 px-4 text-sm',
        size === 'lg' && 'min-h-12 px-6 text-[15px]',
        className
      )}
      {...props}
    />
  );
}
