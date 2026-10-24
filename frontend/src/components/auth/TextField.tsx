import { useId, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & { label: string; error?: string };

export function TextField({ label, error, type = 'text', className, ...props }: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--text)]">{label}</label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'h-10 w-full rounded-lg border bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-muted)]/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            error ? 'border-red-500' : 'border-[var(--border)]',
            isPassword && 'pr-11',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-[var(--text-muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error && <p id={errorId} className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
