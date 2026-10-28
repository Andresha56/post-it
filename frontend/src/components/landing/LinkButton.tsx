import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '../../lib/utils';

type Props = LinkProps & { variant?: 'primary' | 'ghost'; size?: 'md' | 'lg' };

// Router link styled to match the shared Button component.
export function LinkButton({ className, variant = 'primary', size = 'md', ...props }: Props) {
  return (
    <Link
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-bg)]',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active',
        variant === 'ghost' && 'text-[var(--text)] hover:text-primary',
        size === 'md' && 'min-h-[38px] px-[17.5px] text-[13px]',
        size === 'lg' && 'min-h-12 px-6 text-sm',
        className
      )}
      {...props}
    />
  );
}
