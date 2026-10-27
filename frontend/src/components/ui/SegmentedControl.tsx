import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type Option<T extends string> = { value: T; label: string; icon?: ReactNode };

export function SegmentedControl<T extends string>({ options, value, onChange, label }: {
  options: Option<T>[]; value: T; onChange: (value: T) => void; label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors',
            option.value === value ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}
