import { memo } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/utils';

const iconCell = 'relative z-10 grid size-[26px] place-items-center transition-colors';

export const ThemeToggle = memo(function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-[60px] shrink-0 items-center gap-0.5 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-bg)]"
    >
      <span aria-hidden="true" className={cn('absolute left-0.5 size-[26px] rounded-full bg-[var(--surface)] shadow-sm transition-transform', isDark && 'translate-x-7')} />
      <span className={cn(iconCell, isDark ? 'text-[var(--text-subtle)]' : 'text-[var(--text)]')}><Sun size={15} aria-hidden="true" /></span>
      <span className={cn(iconCell, isDark ? 'text-[var(--text)]' : 'text-[var(--text-subtle)]')}><Moon size={15} aria-hidden="true" /></span>
    </button>
  );
});
