import { CalendarDays, Link2, ListChecks, PenLine, Send } from 'lucide-react';

const features = [
  { icon: Link2, title: 'Connect your accounts', body: 'Link the social accounts you publish to, and manage them from a single workspace.' },
  { icon: PenLine, title: 'Write and organize posts', body: 'Draft captions, save work for later, and keep every post sorted by status.' },
  { icon: CalendarDays, title: 'Schedule on a calendar', body: 'Choose a date and time visually, and see the whole week or month at a glance.' },
  { icon: Send, title: 'Publish automatically', body: 'When the time comes, your post goes out without you having to be there.' },
  { icon: ListChecks, title: 'Track what happened', body: 'Published, scheduled, draft or failed. Check the status of every post in one place.' }
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-28">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-semibold text-brand-600">Features</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">Everything between a draft and a published post</h2>
          <p className="mt-4 max-w-md leading-relaxed text-[var(--text-muted)]">One workspace for the steps you repeat every week, so scheduling stops being a chore.</p>
        </div>
        <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {features.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-5 py-6">
              <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-white/10"><Icon size={19} strokeWidth={1.8} /></span>
              <div>
                <h3 className="font-semibold text-[var(--text)]">{title}</h3>
                <p className="mt-1.5 leading-relaxed text-[var(--text-muted)]">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
