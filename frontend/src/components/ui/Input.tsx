// Shared form-control styling so inputs, selects and textareas look the same everywhere.
export const controlClass =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50';
export const inputClass = `${controlClass} h-9`;
export const textareaClass = `${controlClass} py-2`;
export const labelClass = 'block text-sm font-medium text-[var(--text)]';
