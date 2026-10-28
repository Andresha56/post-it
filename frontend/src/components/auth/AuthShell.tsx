import type { ReactNode } from 'react';
import { Logo } from '../landing/Logo';

type Props = { title: string; description: string; children: ReactNode; footer: ReactNode };

export function AuthShell({ title, description, children, footer }: Props) {
  return (
    <div className="grid min-h-screen bg-[var(--app-bg)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between border-r border-[var(--border)] bg-primary-subtle p-10 text-[var(--text)] lg:flex">
        <Logo />
        <div>
          <p className="max-w-sm text-balance text-2xl font-semibold leading-snug tracking-tight">Plan your posts. Let them publish themselves.</p>
          <p className="mt-4 max-w-sm leading-relaxed text-[var(--text-muted)]">Connect your accounts, schedule on a calendar, and keep every post's status in one place.</p>
        </div>
        <span />
      </aside>
      <main className="flex flex-col px-5 py-8 sm:px-8">
        <div className="lg:hidden"><Logo /></div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">{title}</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-sm text-[var(--text-muted)]">{footer}</p>
        </div>
      </main>
    </div>
  );
}
